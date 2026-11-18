// Ep4 props (flat style: #1c1530 ink, one hard shadow tone). Onion, cutting board (perfect cubes / onion juice), chef's knife,
// tear jets, webcam overlay (screen space), student head-and-shoulders for video-call tiles.
import { W, H, INK, rng, clamp, lerp, rect, circ, ell, poly, line, P, halftone, txt, shadeCol, hash, person } from './bgkit.js';
import { rrPath } from './util.js';
const TAU = Math.PI * 2;
export const ONION = '#e8b04c', ONION_SH = '#c4862c', FLESH = '#f7f1dc', FLESH_SH = '#e4dab8', JUICE = 'rgba(236,232,190,0.92)';

// yellow onion: (x,y) = centre of the bulb; s=1 → ~200 px wide
export function onion(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  // roots
  ctx.lineCap = 'round'; for (let i = -3; i <= 3; i++) line(ctx, i * 8, 92, i * 14, 122 + Math.abs(i) * -3, 4);
  const bulb = (c) => { c.moveTo(0, -150); c.bezierCurveTo(30, -110, 110, -80, 104, 0); c.bezierCurveTo(98, 70, 50, 100, 0, 100); c.bezierCurveTo(-50, 100, -98, 70, -104, 0); c.bezierCurveTo(-110, -80, -30, -110, 0, -150); c.closePath(); };
  P(ctx, bulb, ONION, 7);
  ctx.save(); ctx.beginPath(); bulb(ctx); ctx.clip();
  ctx.fillStyle = ONION_SH; ctx.beginPath(); ctx.ellipse(40, 30, 90, 110, 0.3, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(140,80,20,0.55)'; ctx.lineWidth = 4; for (const k of [-0.55, -0.2, 0.2, 0.55]) { ctx.beginPath(); ctx.moveTo(0, -140); ctx.quadraticCurveTo(k * 210, -10, k * 60, 98); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,200,0.55)'; ctx.beginPath(); ctx.ellipse(-48, -30, 16, 44, 0.3, 0, TAU); ctx.fill();
  ctx.restore();
  P(ctx, (c) => { c.moveTo(-8, -146); c.quadraticCurveTo(-2, -190, 14, -206); c.quadraticCurveTo(10, -180, 8, -146); c.closePath(); }, '#d9c38a', 5);
  ctx.restore();
}
// small onion cube (diced piece)
export function cube(ctx, x, y, r = 14, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  P(ctx, (c) => c.rect(-r, -r, r * 2, r * 2), FLESH, Math.max(2, r * 0.22));
  ctx.fillStyle = FLESH_SH; ctx.fillRect(-r + 2, r * 0.3, r * 2 - 4, r * 0.7 - 2);
  ctx.restore();
}
// neat pyramid of perfect cubes centred on (x,y) (bottom row on y)
export function cubePile(ctx, x, y, r = 14, rows = 4, k = 1) {
  let n = 0; const tot = rows * (rows + 1) / 2;
  for (let row = 0; row < rows; row++) { const cnt = rows - row; for (let i = 0; i < cnt; i++) { n++; if (n / tot > k + 1e-6) return; cube(ctx, x + (i - (cnt - 1) / 2) * r * 2.15, y - row * r * 2.1, r, 0); } }
}
// wooden board seen from the front, slightly from above. (x,y) = centre of the top face; s=1 → 640 px wide
export function board(ctx, x, y, s = 1, { cubes = 0, juice = 0, mush = 0, drip = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  P(ctx, (c) => c.roundRect(-320, -10, 640, 60, 22), '#a8693f', 7);
  P(ctx, (c) => c.ellipse(0, 0, 320, 120, 0, 0, TAU), '#d6995e', 7);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 320, 120, 0, 0, TAU); ctx.clip();
  ctx.strokeStyle = 'rgba(150,90,40,0.35)'; ctx.lineWidth = 4; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-320, i * 30); ctx.bezierCurveTo(-120, i * 30 - 10, 120, i * 30 + 12, 320, i * 30); ctx.stroke(); }
  ctx.restore();
  P(ctx, (c) => c.ellipse(230, -40, 26, 12, 0, 0, TAU), '#8e5a33', 4);
  if (cubes > 0) { cubePile(ctx, -30, 30, 18, 5, cubes); }
  if (juice > 0) {   // puddle of onion juice, mashed shreds, a drip running over the front edge
    const k = clamp(juice), R = rng(5);
    P(ctx, (c) => { const n = 14; for (let i = 0; i <= n; i++) { const a = i / n * TAU, r = (1 + 0.18 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 5)) * k; const px = Math.cos(a) * 250 * r, py = Math.sin(a) * 82 * r + 6; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); }, JUICE, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-90 * k, -20 * k, 60 * k, 10 * k, -0.1, 0, TAU); ctx.fill();
    for (let i = 0; i < 26 * k; i++) { const a = R() * TAU, d = Math.sqrt(R()) * 0.8; ctx.save(); ctx.translate(Math.cos(a) * 220 * d * k, Math.sin(a) * 70 * d * k); ctx.rotate(R() * 3); P(ctx, (c) => c.ellipse(0, 0, 10 + R() * 12, 3 + R() * 3, 0, 0, TAU), FLESH, 3); ctx.restore(); }
    for (let i = 0; i < 3; i++) { const dx = -140 + i * 150, L = (40 + 120 * hash(i + 3)) * clamp(drip - i * 0.2); if (L > 2) {
      P(ctx, (c) => { c.moveTo(dx - 14, 60); c.lineTo(dx - 9, 60 + L); c.arc(dx, 60 + L, 9, Math.PI, 0, true); c.lineTo(dx + 14, 60); c.closePath(); }, JUICE, 4);
      const ph = (t * 1.3 + i * 0.37) % 1, dy = 60 + L + ph * 520; circ(ctx, dx, dy, 10 * (1 - ph * 0.3), JUICE, 3); } }
  }
  if (mush > 0) { const R = rng(9); for (let i = 0; i < 30 * mush; i++) { const a = R() * TAU, d = R(); ctx.save(); ctx.translate(Math.cos(a) * 200 * d, Math.sin(a) * 60 * d); ctx.rotate(R() * 3); P(ctx, (c) => c.ellipse(0, 0, 14, 6, 0, 0, TAU), FLESH, 3); ctx.restore(); } }
  ctx.restore();
}
// chef's knife: (x,y) = where blade meets handle; rot radians; s=1 → ~460 px long
export function knife(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => c.roundRect(-150, -22, 150, 44, 16), '#3a2a24', 6); circ(ctx, -110, 0, 6, '#c3ccd5', 3); circ(ctx, -50, 0, 6, '#c3ccd5', 3);
  P(ctx, (c) => { c.moveTo(0, -30); c.lineTo(250, -30); c.quadraticCurveTo(320, -24, 330, 0); c.quadraticCurveTo(250, 40, 0, 40); c.closePath(); }, '#dfe6ec', 6);
  ctx.fillStyle = '#b8c3cc'; ctx.beginPath(); ctx.moveTo(4, 14); ctx.lineTo(250, 14); ctx.quadraticCurveTo(300, 14, 316, 6); ctx.quadraticCurveTo(250, 36, 4, 36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(30, -20, 160, 6);
  ctx.restore();
}
// cartoon tear jets from an eye at (x,y): dir -1 left / +1 right; amt 0..1 (0.3 = drip, 1 = garden-hose fountain)
export function tearJet(ctx, x, y, dir, amt, t, { len = 380, seed = 1 } = {}) {
  if (amt <= 0) return; const a = clamp(amt);
  ctx.save();
  if (a < 0.5) { // streaming drip down the cheek
    const L = 40 + 200 * a; P(ctx, (c) => { c.moveTo(x - 10, y); c.quadraticCurveTo(x - 14 + dir * 6, y + L * 0.6, x + dir * 4, y + L); c.quadraticCurveTo(x + 14 + dir * 6, y + L * 0.6, x + 10, y); c.closePath(); }, '#8fd6ff', 4);
    const ph = (t * 1.6 + seed * 0.3) % 1; circ(ctx, x + dir * 6, y + L + ph * 140, 12, '#8fd6ff', 4);
  } else {        // arcing fountain: a thick ribbon + droplets
    const k = (a - 0.5) * 2, L = len * (0.5 + 0.5 * k), hgt = 140 * k + 40;
    const pt = (u) => [x + dir * L * u, y - hgt * 4 * u * (1 - u) * 0.9 + u * u * 260];
    ctx.lineCap = 'round';
    for (const [w, col] of [[44 * (0.6 + 0.4 * k) + 12, INK], [44 * (0.6 + 0.4 * k), '#8fd6ff']]) { ctx.beginPath(); for (let i = 0; i <= 20; i++) { const [px, py] = pt(i / 20); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.lineWidth = w * (col === INK ? 1 : 1); ctx.strokeStyle = col; ctx.stroke(); }
    ctx.beginPath(); for (let i = 0; i <= 20; i++) { const [px, py] = pt(i / 20); i ? ctx.lineTo(px, py - 8) : ctx.moveTo(px, py - 8); } ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.stroke();
    for (let i = 0; i < 9; i++) { const ph = (t * 1.8 + hash(i + seed) ) % 1, u = 0.6 + ph * 0.7; const [px, py] = pt(Math.min(u, 1.3)); circ(ctx, px + (hash(i * 3 + seed) - 0.5) * 60, py + ph * 120, 10 + 10 * hash(i + 7), '#8fd6ff', 4); }
  }
  ctx.restore();
}
// head-and-shoulders student in a tile (draw in tile-local coordinates, clip outside). (cx, cy) = head centre, r = head radius
export function student(ctx, cx, cy, r, seed, { t = 0, wave = 0, look = 0 } = {}) {
  const h = r / 38 * 300, s = h / 300; // person(): headR = 38*s, headY = feetY - 277*s
  person(ctx, cx, cy + 277 * s, h, { seed, t, face: look < 0 ? 'l' : look > 0 ? 'r' : null });
  if (wave > 0) { const a = Math.sin(t * 10) * 0.35 * wave; ctx.save(); ctx.translate(cx + r * 1.9, cy + r * 1.2); ctx.rotate(a); P(ctx, (c) => c.roundRect(-r * 0.32, -r * 1.3, r * 0.64, r * 1.3, r * 0.3), '#e8b48f', Math.max(2, r * 0.08)); ctx.restore(); }
}
// screen-space webcam overlay: tile border, name label, mic icon, LIVE dot. muted:boolean, speak 0..1 (green talking border)
export function webcam(ctx, { name = 'Sam (You)', muted = true, live = true, speak = 0, t = 0, camOff = 0 } = {}) {
  const rs = ctx.canvas.width / W; ctx.save(); ctx.setTransform(rs, 0, 0, rs, 0, 0);
  const m = 26;
  if (camOff > 0) { ctx.globalAlpha = clamp(camOff); ctx.fillStyle = '#17151f'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    if (camOff >= 1) { circ(ctx, W / 2, H * 0.42, 150, '#3a3846', 0); txt(ctx, '📷', W / 2, H * 0.42, { font: 'Noto Color Emoji', size: 120, weight: 400 }); ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2 - 110, H * 0.42 - 110); ctx.lineTo(W / 2 + 110, H * 0.42 + 110); ctx.stroke();
      txt(ctx, 'Camera is off', W / 2, H * 0.42 + 230, { size: 52, weight: 700, col: '#d6d6de' }); } }
  ctx.strokeStyle = speak > 0 ? `rgba(60,220,110,${0.6 + 0.4 * speak})` : 'rgba(255,255,255,0.85)'; ctx.lineWidth = speak > 0 ? 18 : 10;
  ctx.beginPath(); rrPath(ctx, m, m, W - 2 * m, H - 2 * m, 50); ctx.stroke();
  // name label bottom-left (above the IG UI zone)
  ctx.font = '700 44px Inter, sans-serif'; const nw = ctx.measureText(name).width;
  const ly = 64; ctx.fillStyle = 'rgba(12,10,20,0.72)'; ctx.beginPath(); rrPath(ctx, 56, ly, nw + 130, 84, 24); ctx.fill();
  circ(ctx, 102, ly + 42, 26, muted ? '#ff4d4d' : '#3cdc6e', 0); txt(ctx, muted ? '🔇' : '🎤', 102, ly + 44, { font: 'Noto Color Emoji', size: 28, weight: 400 });
  ctx.font = '700 44px Inter, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(name, 142, ly + 44);
  if (live) { ctx.fillStyle = 'rgba(12,10,20,0.72)'; ctx.beginPath(); rrPath(ctx, W - 250, 70, 190, 74, 22); ctx.fill(); circ(ctx, W - 212, 107, 14, Math.floor(t * 2) % 2 ? '#ff4d4d' : '#ff8080', 0); txt(ctx, 'LIVE', W - 140, 109, { size: 40, weight: 800, col: '#fff' }); }
  ctx.restore();
}
