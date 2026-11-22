// Ep9 props (flat style: #1c1530 ink, one hard shadow tone). All names invented.
// the rock-hard loaf (burnt boule, cracks; soggy = soaked in Alfredo soup), Sam's apartment oven (smoke leaking from the door),
// the counter dent, a real brick for comparison, a spotlight cone, the critic's notebook (one unreadable word), hands, spoon, soup splash.
import { W, H, INK, clamp, lerp, circ, ell, P, clipTo, txt, glow, hash, castShadow, blobPath, speckle } from './bgkit.js';
import { eOut } from './util.js';
const TAU = Math.PI * 2;

/* ---------------- the loaf: a burnt round boule. soggy 0..1 (pale + swollen + drips), crack 0..1, steam ---------------- */
export function loaf(ctx, x, y, s = 1, { rot = 0, soggy = 0, crack = 0, t = 0, bite = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (1 + soggy * 0.06), s * (1 - soggy * 0.04));
  const mix = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = (sh) => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, k)); return `rgb(${c(16)},${c(8)},${c(0)})`; };
  const k = clamp(soggy), body = mix('#5a3220', '#e9cf9a', k), dark = mix('#2e1a12', '#c9a56a', k), top = mix('#7a4528', '#f3dfae', k);
  const shape = (c) => { c.moveTo(-170, 40); c.bezierCurveTo(-180, -60, -110, -120, 0, -122); c.bezierCurveTo(110, -120, 180, -60, 170, 40); c.bezierCurveTo(160, 80, 90, 92, 0, 92); c.bezierCurveTo(-90, 92, -160, 80, -170, 40); c.closePath(); };
  P(ctx, shape, body, 9);
  clipTo(ctx, shape, () => {
    ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(60, 70, 220, 70, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(-50, -80, 90, 34, -0.2, 0, TAU); ctx.fill();
    // charcoal patches
    if (k < 0.8) { ctx.globalAlpha = 1 - k; for (let i = 0; i < 7; i++) { ctx.fillStyle = '#1e120d'; ctx.beginPath(); blobPath(ctx, -130 + hash(i * 3.3) * 260, -60 + hash(i * 5.1) * 130, 16 + hash(i) * 22, i + 2, 8, 0.4); ctx.fill(); } ctx.globalAlpha = 1; }
    speckle(ctx, -170, -120, 340, 210, k > 0.5 ? 'rgba(160,110,50,0.4)' : 'rgba(20,10,5,0.5)', 40, 9, 4);
  });
  // scoring slashes
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 70, -95 + Math.abs(i) * 14); ctx.quadraticCurveTo(-30 + i * 70, -70, -10 + i * 70, -40 + Math.abs(i) * 10); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); }
  if (crack > 0) { ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = INK; const c = clamp(crack); ctx.beginPath(); ctx.moveTo(40, -110); ctx.lineTo(40 + 20 * c, -70 * c - 40 * (1 - c)); ctx.lineTo(10 + 30 * c, -30 * c); ctx.lineTo(50 * c + 10, 10 * c); ctx.stroke(); ctx.restore(); }
  if (bite > 0) { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(150 - i * 4, -60 + i * 40, 42 * bite, 0, TAU); ctx.fill(); } ctx.restore(); }
  if (k > 0.3) { ctx.globalAlpha = k; for (let i = 0; i < 4; i++) { const dx = -120 + i * 80, L = 30 + hash(i * 2.2) * 50 + Math.sin(t * 3 + i) * 8; P(ctx, (c) => { c.moveTo(dx - 12, 80); c.quadraticCurveTo(dx, 80 + L * 1.4, dx + 12, 80); c.closePath(); }, '#f1ecdc', 5); } ctx.globalAlpha = 1; }
  ctx.restore();
}
/* ---------------- a red brick (for comparison) ---------------- */
export function brick(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  castShadow(ctx, (c) => c.roundRect(-150, -10, 320, 40, 10), 16, 14);
  P(ctx, (c) => { c.moveTo(-160, -70); c.lineTo(110, -70); c.lineTo(160, -100); c.lineTo(160, 0); c.lineTo(110, 30); c.lineTo(-160, 30); c.closePath(); }, '#b8432f', 8);
  P(ctx, (c) => { c.moveTo(-160, -70); c.lineTo(-110, -100); c.lineTo(160, -100); c.lineTo(110, -70); c.closePath(); }, '#d65a40', 7);
  P(ctx, (c) => { c.moveTo(110, -70); c.lineTo(160, -100); c.lineTo(160, 0); c.lineTo(110, 30); c.closePath(); }, '#8f3020', 7);
  speckle(ctx, -150, -60, 250, 85, 'rgba(60,15,10,0.45)', 30, 3, 4);
  ctx.restore();
}
/* ---------------- the counter dent: a crater + radial cracks (k 0..1) ---------------- */
export function dent(ctx, x, y, k = 1, seed = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y);
  P(ctx, (c) => c.ellipse(0, 0, 170 * k, 30 * k, 0, 0, TAU), 'rgba(28,21,48,0.35)', 6);
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + hash(i + seed), L = (90 + hash(i * 3 + seed) * 120) * k; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 150 * k, Math.sin(a) * 26 * k); ctx.lineTo(Math.cos(a) * (150 * k + L * 0.6) + 14, Math.sin(a) * (26 * k + L * 0.25)); ctx.lineTo(Math.cos(a) * (150 * k + L), Math.sin(a) * (26 * k + L * 0.4)); ctx.stroke(); }
  ctx.restore();
}
/* ---------------- Sam's apartment oven, front view. (x,y) = floor centre. smoke 0..1, glow 0..1, open 0..1 (door drops) ---------------- */
export function oven(ctx, x, y, s = 1, { smoke = 0, glow: gl = 0.6, open = 0, t = 0, shake = 0 } = {}) {
  ctx.save(); ctx.translate(x + Math.sin(t * 60) * shake * 6, y); ctx.scale(s, s);
  castShadow(ctx, (c) => c.roundRect(-300, -20, 620, 40, 12), 18, 10);
  P(ctx, (c) => c.roundRect(-300, -960, 600, 960, 26), '#e9e4da', 9);
  clipTo(ctx, (c) => c.roundRect(-300, -960, 600, 960, 26), () => { ctx.fillStyle = '#cfc8bb'; ctx.fillRect(180, -960, 140, 960); });
  // control panel
  P(ctx, (c) => c.roundRect(-280, -940, 560, 150, 18), '#3a3646', 7);
  for (let i = 0; i < 4; i++) { circ(ctx, -200 + i * 80, -865, 28, '#e9e4da', 6); ctx.save(); ctx.translate(-200 + i * 80, -865); ctx.rotate(i * 0.7 + (i === 3 ? gl * 2 : 0)); ctx.fillStyle = INK; ctx.fillRect(-4, -26, 8, 22); ctx.restore(); }
  P(ctx, (c) => c.roundRect(110, -900, 140, 70, 10), '#14121a', 5); txt(ctx, smoke > 0.4 ? '!!!' : '450°', 180, -864, { font: 'Anton', size: 44, weight: 400, col: smoke > 0.4 ? '#ff4d4d' : '#7ee081' });
  // door
  ctx.save(); ctx.translate(0, -60); ctx.scale(1, 1 - open * 1.6); ctx.translate(0, 60);
  P(ctx, (c) => c.roundRect(-270, -740, 540, 680, 22), '#d9d3c7', 8);
  P(ctx, (c) => c.roundRect(-210, -680, 420, 380, 18), '#2a1a16', 7);
  clipTo(ctx, (c) => c.roundRect(-210, -680, 420, 380, 18), () => {
    glow(ctx, 0, -470, 320, '#ff8a2a', 0.9 * gl); ctx.fillStyle = `rgba(255,120,40,${0.35 * gl})`; ctx.fillRect(-210, -680, 420, 380);
    ctx.strokeStyle = '#ff5a1a'; ctx.lineWidth = 8; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-190, -640 + i * 300); for (let j = 0; j < 12; j++) ctx.lineTo(-190 + j * 34, -640 + i * 300 + (j % 2 ? 14 : -14)); ctx.stroke(); }
    if (smoke > 0) { ctx.globalAlpha = clamp(smoke); for (let i = 0; i < 6; i++) { circ(ctx, -160 + i * 64 + Math.sin(t * 2 + i) * 14, -560 + (i % 2) * 60, 70, '#4a4250', 0); } ctx.globalAlpha = 1; }
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(60, -680); ctx.lineTo(150, -680); ctx.lineTo(0, -300); ctx.lineTo(-90, -300); ctx.closePath(); ctx.fill();
  });
  P(ctx, (c) => c.roundRect(-230, -735, 460, 34, 17), '#a9a397', 6);
  ctx.restore();
  P(ctx, (c) => c.roundRect(-270, -50, 540, 40, 10), '#3a3646', 6);
  ctx.restore();
}
/* ---------------- spotlight cone from above (screen-space-ish), a 0..1 ---------------- */
export function spotlight(ctx, x, y, w, a = 1, { top = -200, col = '255,244,200' } = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, top, 0, y); g.addColorStop(0, `rgba(${col},${0.55 * a})`); g.addColorStop(1, `rgba(${col},${0.22 * a})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w * 0.12, top); ctx.lineTo(x + w * 0.12, top); ctx.lineTo(x + w / 2, y); ctx.lineTo(x - w / 2, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(${col},${0.35 * a})`; ctx.beginPath(); ctx.ellipse(x, y, w / 2, w * 0.09, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
export function motes(ctx, x, y0, y1, w, t, n = 24) { ctx.save(); for (let i = 0; i < n; i++) { const fx = x + (hash(i * 1.7) - 0.5) * w * (0.3 + 0.7 * hash(i * 9.1)), fy = lerp(y0, y1, (hash(i * 4.3) + t * 0.03 * (0.5 + hash(i))) % 1); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + i); circ(ctx, fx + Math.sin(t + i) * 10, fy, 3 + hash(i * 2.9) * 4, '#fff6d6', 0); } ctx.restore(); }
/* ---------------- a hand from below/side with sleeve; sleeve/skin configurable; (x,y) = knuckles; arm extends toward +y ---------------- */
export function arm(ctx, x, y, s = 1, rot = 0, { sleeve = '#25222e', cuff = '#f4f1ea', skin = '#e3c2a6', skinS = '#c19c80', fist = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 900); ctx.lineWidth = 136; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 120; ctx.strokeStyle = sleeve; ctx.stroke();
  P(ctx, (c) => c.roundRect(-60, 10, 120, 46, 14), cuff, 6);
  P(ctx, (c) => c.ellipse(0, -40, 58, 64, 0, 0, TAU), skin, 7);
  if (fist) { for (let i = 0; i < 3; i++) P(ctx, (c) => c.arc(-30 + i * 30, -92, 18, Math.PI, TAU), null, 5); }
  else P(ctx, (c) => c.arc(-16, -64, 22, 3.4, 5.6), null, 5, skinS);
  ctx.restore();
}
/* ---------------- silver spoon: (x,y) = bowl centre; rot; holds a soggy bread chunk (bread 0..1) ---------------- */
export function spoon(ctx, x, y, s = 1, rot = 0, { bread = 0, soup = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => c.roundRect(-11, 20, 22, 300, 11), '#cfd4dc', 5);
  P(ctx, (c) => c.ellipse(0, 0, 46, 32, 0, 0, TAU), '#dfe3ea', 6);
  if (soup > 0) { ctx.globalAlpha = clamp(soup); ell(ctx, 0, -2, 34, 20, '#f1ecdc', 0); ctx.globalAlpha = 1; }
  if (bread > 0) { ctx.save(); ctx.scale(bread, bread); P(ctx, (c) => blobPath(c, 0, -26, 44, 5, 9, 0.25), '#e9cf9a', 6); P(ctx, (c) => c.ellipse(-10, -40, 20, 10, -0.3, 0, TAU), '#f3dfae', 0); ctx.restore(); }
  ctx.restore();
}
/* ---------------- soup splash: crown + flying droplets. (x,y) = impact point, p 0..1 ---------------- */
export function splash(ctx, x, y, p, { seed = 3, spread = 700, n = 26, col = '#f1ecdc' } = {}) {
  if (p <= 0 || p >= 1.4) return; const k = clamp(p);
  ctx.save(); ctx.translate(x, y);
  // crown
  const cr = eOut(clamp(p * 2.2)) * (1 - clamp((p - 0.5) * 2)); if (cr > 0) { ctx.save(); ctx.scale(1, cr); for (let i = 0; i < 9; i++) { const a = -Math.PI + (i + 0.5) / 9 * Math.PI, xx = Math.cos(a) * 200, hh = 90 + hash(i + seed) * 110; P(ctx, (c) => { c.moveTo(xx - 26, 0); c.quadraticCurveTo(xx * 1.15 - 6, -hh * 0.6, xx * 1.3, -hh); c.quadraticCurveTo(xx * 1.1 + 12, -hh * 0.4, xx + 26, 0); c.closePath(); }, col, 6); } ctx.restore(); }
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.08 + 0.84 * hash(i * 1.9 + seed)), v = spread * (0.5 + 0.7 * hash(i * 3.7 + seed)), r = 10 + hash(i * 5.3) * 16;
    const px = Math.cos(a) * v * k, py = Math.sin(a) * v * k + 900 * k * k;
    P(ctx, (c) => c.arc(px, py, r, 0, TAU), col, 4);
  }
  ctx.restore();
}
export function soupSpots(ctx, x, y, r, n = 6, seed = 2, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < n; i++) { const px = x + (hash(i * 2.1 + seed) - 0.5) * r * 2, py = y + (hash(i * 3.9 + seed) - 0.5) * r * 1.6, rr = r * (0.05 + hash(i * 7.7 + seed) * 0.06); P(ctx, (c) => { c.ellipse(px, py, rr, rr, 0, 0, TAU); }, '#f1ecdc', 4); P(ctx, (c) => { c.moveTo(px - rr * 0.6, py); c.quadraticCurveTo(px, py + rr * 3, px + rr * 0.6, py); c.closePath(); }, '#f1ecdc', 4); } ctx.restore(); }
/* ---------------- the critic's notebook, top-down. (x,y) centre. write 0..1 (the ONE word scribbles in), old notes on the left page ---------------- */
export function notebook(ctx, x, y, s = 1, { write = 0, rot = 0, close = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  castShadow(ctx, (c) => c.roundRect(-430, -300, 860, 600, 22), 24, 30, 'rgba(14,8,30,0.4)');
  P(ctx, (c) => c.roundRect(-440, -310, 880, 620, 24), '#1c1a22', 8);
  const cw = 1 - clamp(close);
  // left page (only while open)
  if (cw > 0.02) {
    ctx.save(); ctx.scale(1, 1);
    P(ctx, (c) => c.roundRect(-410, -285, 400, 570, 10), '#f7f1e1', 6);
    ctx.strokeStyle = 'rgba(80,120,200,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-395, -220 + i * 58); ctx.lineTo(-25, -220 + i * 58); ctx.stroke(); }
    txt(ctx, 'Bistro Nove ★', -300, -240, { font: 'Inter', size: 26, weight: 800, col: '#3a3646' });
    ctx.strokeStyle = 'rgba(40,40,70,0.55)'; ctx.lineWidth = 4; for (let i = 0; i < 7; i++) { const L = 200 + hash(i * 3.1) * 140; ctx.beginPath(); ctx.moveTo(-385, -170 + i * 58); for (let j = 0; j < L; j += 14) ctx.lineTo(-385 + j, -170 + i * 58 + Math.sin(j * 0.3 + i) * 7); ctx.stroke(); }
    ctx.restore();
  }
  // right page / closing cover
  ctx.save(); ctx.translate(0, 0); ctx.scale(cw * 2 - 1, 1);
  if (cw > 0.5) {
    P(ctx, (c) => c.roundRect(10, -285, 400, 570, 10), '#f7f1e1', 6);
    ctx.strokeStyle = 'rgba(80,120,200,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(25, -220 + i * 58); ctx.lineTo(395, -220 + i * 58); ctx.stroke(); }
    txt(ctx, 'LUMIÈRE —', 120, -240, { font: 'Inter', size: 28, weight: 800, col: '#3a3646' });
    scribble(ctx, 210, -20, write, t);
  } else { P(ctx, (c) => c.roundRect(10, -300, 420, 600, 18), '#25222e', 7); ctx.save(); ctx.scale(-1, 1); txt(ctx, 'NOTES', -220, 0, { font: 'Anton', size: 70, weight: 400, col: '#e6b84a' }); ctx.restore(); }
  ctx.restore();
  // spine
  P(ctx, (c) => c.roundRect(-14, -300, 28, 600, 10), '#2a2733', 5);
  ctx.restore();
}
// the ONE word: an illegible loopy scrawl (deliberately unreadable), drawn progressively
export function scribble(ctx, x, y, k = 1, t = 0) {
  if (k <= 0) return; const pts = []; const N = 120;
  for (let i = 0; i <= N; i++) { const u = i / N, a = u * TAU * 5.5; pts.push([x - 160 + u * 320 + Math.cos(a) * 34, y + Math.sin(a) * 52 * (0.7 + 0.5 * hash(Math.floor(u * 9))) - (Math.floor(u * 6) % 2) * 20]); }
  const m = Math.max(2, Math.floor(pts.length * clamp(k)));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#a3202c'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < m; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
  if (k >= 1) { ctx.beginPath(); ctx.moveTo(x - 170, y + 80); ctx.quadraticCurveTo(x, y + 100, x + 170, y + 70); ctx.stroke(); }  // underline
  ctx.restore();
  return pts[m - 1];
}
// a fountain pen; (x,y) = nib tip
export function pen(ctx, x, y, s = 1, rot = 0.5) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(0, 0); c.lineTo(-16, -50); c.lineTo(16, -50); c.closePath(); }, '#e6b84a', 5);
  P(ctx, (c) => c.roundRect(-20, -330, 40, 285, 16), '#a3202c', 6);
  P(ctx, (c) => c.roundRect(-6, -320, 10, 140, 5), '#e6b84a', 3);
  ctx.restore();
}
export { W, H };
