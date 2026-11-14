// Shared drawing helpers for the flat-2D look: thick ink outlines, flat fills, one hard shadow tone.
export const W = 1080, H = 1920, FPS = 30;
export const INK = '#1c1530';

export function rng(seed) { // mulberry32, deterministic
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, x) => a + (b - a) * x;
export const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lin = (a, b, x) => clamp((x - a) / (b - a));
export const eOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const eIn = (t) => Math.pow(clamp(t), 3);
export const eInOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const eBack = (t) => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

export function rrPath(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function ink(ctx, lw, col = INK) { if (!lw) return; ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
// generic: build path with fn, fill, stroke
export function P(ctx, fn, fill, lw = 6, stroke = INK) { ctx.beginPath(); fn(ctx); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ink(ctx, lw, stroke); }
export function rect(ctx, x, y, w, h, fill, lw = 6, r = 0) { P(ctx, (c) => r ? rrPath(c, x, y, w, h, r) : c.rect(x, y, w, h), fill, lw); }
export function circ(ctx, x, y, r, fill, lw = 6) { P(ctx, (c) => c.arc(x, y, r, 0, Math.PI * 2), fill, lw); }
export function ell(ctx, x, y, rx, ry, fill, lw = 6, rot = 0) { P(ctx, (c) => c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2), fill, lw); }
export function poly(ctx, pts, fill, lw = 6, close = true) { P(ctx, (c) => { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); if (close) c.closePath(); }, fill, lw); }
export function line(ctx, x1, y1, x2, y2, lw = 6, col = INK) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ink(ctx, lw, col); }
// draw inside a clip of a path
export function clipTo(ctx, fn, draw) { ctx.save(); ctx.beginPath(); fn(ctx); ctx.clip(); draw(); ctx.restore(); }
// box with hard shadow band (side: 'r' right, 'b' bottom, 'l', 't'), shadow width sw
export function box(ctx, x, y, w, h, fill, shadow, { r = 0, lw = 6, side = 'r', sw = 0.22 } = {}) {
  const path = (c) => r ? rrPath(c, x, y, w, h, r) : c.rect(x, y, w, h);
  P(ctx, path, fill, 0);
  if (shadow) clipTo(ctx, path, () => {
    ctx.fillStyle = shadow;
    const s = sw < 1 ? sw * (side === 'r' || side === 'l' ? w : h) : sw;
    if (side === 'r') ctx.fillRect(x + w - s, y - 2, s + 2, h + 4);
    else if (side === 'l') ctx.fillRect(x - 2, y - 2, s + 2, h + 4);
    else if (side === 'b') ctx.fillRect(x - 2, y + h - s, w + 4, s + 2);
    else ctx.fillRect(x - 2, y - 2, w + 4, s + 2);
  });
  P(ctx, path, null, lw);
}
// halftone dots across a region, size fading along a direction (dir: 'down','up','right','left','none')
export function halftone(ctx, x, y, w, h, col, step = 18, rmax = 4, dir = 'down', alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = col; ctx.beginPath();
  for (let j = 0, yy = y; yy < y + h; yy += step, j++) for (let xx = x + (j % 2) * step / 2; xx < x + w; xx += step) {
    let k = dir === 'down' ? (yy - y) / h : dir === 'up' ? 1 - (yy - y) / h : dir === 'right' ? (xx - x) / w : dir === 'left' ? 1 - (xx - x) / w : 1;
    const r = rmax * clamp(k); if (r < 0.4) continue; ctx.moveTo(xx + r, yy); ctx.arc(xx, yy, r, 0, Math.PI * 2);
  }
  ctx.fill(); ctx.restore();
}
export function stripes(ctx, x, y, w, h, col, step = 60, sw = 26) { ctx.fillStyle = col; for (let xx = x; xx < x + w; xx += step) ctx.fillRect(xx, y, sw, h); }
// small speckles (paint grain accents)
export function speckle(ctx, x, y, w, h, col, n, seed, rmax = 3) { const R = rng(seed); ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < n; i++) { const px = x + R() * w, py = y + R() * h, r = 0.8 + R() * rmax; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); } ctx.fill(); }
export function txt(ctx, s, x, y, { font = 'Inter', size = 40, weight = 700, col = INK, align = 'center', base = 'middle', stroke = 0, scol = INK, style = '', spacing = 0 } = {}) {
  ctx.font = `${style} ${weight} ${size}px ${font.includes(',') || font.includes('"') ? font : '"' + font + '"'}`; ctx.textAlign = align; ctx.textBaseline = base;
  if (spacing) ctx.letterSpacing = spacing + 'px';
  if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = scol; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = col; ctx.fillText(s, x, y);
  if (spacing) ctx.letterSpacing = '0px';
}
// soft radial glow (additive feel)
export function glow(ctx, x, y, r, col, a = 0.5) { ctx.save(); ctx.globalAlpha *= a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
// seeded wobbly blob path (for splats, clouds)
export function blobPath(ctx, x, y, r, seed, n = 9, wob = 0.3) {
  const R = rng(seed); const pts = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = r * (1 - wob / 2 + R() * wob); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  ctx.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.closePath();
}
let _grain = null;
export function grain(ctx, a = 0.06) { // deterministic film grain overlay
  if (!_grain) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const d = g.createImageData(256, 256); const R = rng(7); for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); _grain = c; }
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(_grain, 'repeat'); ctx.fillRect(-200, -200, W + 400, H + 400); ctx.restore();
}
export function vignette(ctx, a = 0.35) { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(10,6,25,0)'); g.addColorStop(1, `rgba(10,6,25,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
export function shadeCol(hex, k) { // darken (k<0) / lighten (k>0)
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
