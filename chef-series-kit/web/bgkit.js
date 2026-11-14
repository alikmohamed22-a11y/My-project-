// bgkit: layered-set system (parallax + per-shot static caches + depth blur), lighting/texture helpers, shared props.
import { W, H, INK, rng, clamp, lerp, rect, circ, ell, poly, line, P, box, clipTo, halftone, stripes, speckle, txt, glow, blobPath, rrPath, shadeCol, hash } from './util.js';
import { CAM, layerCorr, layerMatAt, blurred } from './camera.js';
export { W, H, INK, rng, clamp, lerp, rect, circ, ell, poly, line, P, box, clipTo, halftone, stripes, speckle, txt, glow, blobPath, rrPath, shadeCol, hash };

export const M = 260; // default paint margin around the frame
export const fillAll = (ctx, col, b = [-M, -M, W + M, H + M]) => { ctx.fillStyle = col; ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); };
const NOCACHE = typeof location !== 'undefined' && new URLSearchParams(location.search).get('nocache') === '1';

/* ===================== layered sets =====================
 defSet(name, {
   bounds:[x0,y0,x1,y1]          painted world extent (default frame + 260 margin)
   skey:(o)=>string              options that change STATIC art (cache key); time-varying art goes in anim()
   resolve:(o)=>otherSetName     optional redirect (e.g. kitchen doorway view)
   layers:[{ name, d, blur, front, bounds, stat(ctx,o), anim(ctx,o) }]
        d     depth: 1 = character plane, <1 farther (moves less), >1 foreground (moves more)
        blur  static depth blur in world px (baked into the cache)
        front true = drawn by drawFg (in front of characters)
   grade:(ctx,o)=>void           colour key / haze / vignette, drawn last by drawFg (affects characters too)
 })                                                                                                             */
export const SETS = {};
export function defSet(name, spec) { SETS[name] = spec; return spec; }
const CACHE = new Map(); let cachePx = 0; const MAXPX = 90e6;
export const STATS = { builds: 0, hits: 0 };
function evict() { while (cachePx > MAXPX && CACHE.size > 1) { const [k, v] = CACHE.entries().next().value; CACHE.delete(k); cachePx -= v.px; v.cv.width = v.cv.height = 0; } }
function cacheFor(name, set, L, o, rel) {
  const C = CAM.cur; const sk = set.skey ? set.skey(o) : '';
  const rk = [rel.a, rel.b, rel.c, rel.d, rel.e, rel.f].map((v) => v.toFixed(3)).join(',');
  const key = `${name}|${L.name}|${sk}|${C.id}|${rk}|${C.rs}`;
  const hit = CACHE.get(key); if (hit) { CACHE.delete(key); CACHE.set(key, hit); STATS.hits++; return hit; }
  // visible world region of this layer over the whole shot (sampled), + margin for shake/drift
  const cw = W * C.rs, ch = H * C.rs; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, sc = 0; const d = L.d ?? 1;
  const step = Math.max(1, Math.floor(C.len / 24));
  for (let lf = 0; lf <= C.len; lf += step) { const m = layerMatAt(d, Math.min(lf, C.len - 1)).multiply(rel); const inv = m.inverse();
    sc = Math.max(sc, Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)));
    for (const [px, py] of [[0, 0], [cw, 0], [0, ch], [cw, ch]]) { const p = inv.transformPoint(new DOMPoint(px, py)); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); } }
  const mg = 70 + (L.blur || 0) * 3, b = L.bounds || set.bounds || [-M, -M, W + M, H + M];
  x0 = Math.max(b[0], x0 - mg); y0 = Math.max(b[1], y0 - mg); x1 = Math.min(b[2], x1 + mg); y1 = Math.min(b[3], y1 + mg);
  if (x1 <= x0 || y1 <= y0) { const e = { cv: null, px: 0 }; CACHE.set(key, e); return e; }
  let res = sc * (L.blur ? 0.5 : 1); const w = x1 - x0, h = y1 - y0; res = Math.min(res, Math.sqrt(20e6 / (w * h)));
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * res); cv.height = Math.ceil(h * res);
  const g = cv.getContext('2d'); g.setTransform(res, 0, 0, res, -x0 * res, -y0 * res); g.save(); L.stat(g, o); g.restore();
  let out = cv;
  if (L.blur) { const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; const g2 = c2.getContext('2d'); g2.filter = `blur(${(L.blur * res).toFixed(2)}px)`; g2.drawImage(cv, 0, 0); cv.width = cv.height = 0; out = c2; }
  const e = { cv: out, x: x0, y: y0, w, h, px: out.width * out.height }; STATS.builds++;
  CACHE.set(key, e); cachePx += e.px; evict(); return e;
}
function drawLayer(ctx, name, set, L, o, rel, extraBlur) {
  ctx.save();
  const C = CAM.cur, corr = C ? layerCorr(L.d ?? 1) : null;
  if (corr) ctx.setTransform(C.base.multiply(corr).multiply(rel));
  const body = (g) => {
    if (L.stat) {
      if (C && !NOCACHE) { const e = cacheFor(name, set, L, o, rel); if (e.cv) g.drawImage(e.cv, e.x, e.y, e.w, e.h); }
      else if (L.blur) blurred(g, L.blur, (h) => L.stat(h, o)); else { g.save(); L.stat(g, o); g.restore(); }
    }
    if (L.anim) { g.save(); L.anim(g, o); g.restore(); }
  };
  if (extraBlur > 0.4) blurred(ctx, extraBlur, body); else body(ctx);
  ctx.restore();
}
export function drawLayers(ctx, name, o, front) {
  let set = SETS[name]; if (set.resolve) { const n2 = set.resolve(o); if (n2 && SETS[n2]) { name = n2; set = SETS[n2]; } }
  const C = CAM.cur; const rel = C ? C.base.inverse().multiply(ctx.getTransform()) : null;
  const fb = C && !front ? C.focus.bg : 0, Ls = set.layers.filter((L) => !!L.front === !!front);
  if (fb > 0.4) blurred(ctx, fb, (g) => { for (const L of Ls) drawLayer(g, name, set, L, o, rel, 0); }); // rack focus: one blur pass for all back layers
  else for (const L of Ls) drawLayer(ctx, name, set, L, o, rel, 0);
  if (front && set.grade) { ctx.save(); set.grade(ctx, o); ctx.restore(); }
}

/* ===================== lighting & texture helpers =====================
 mode 'source-atop' (default) = tint only what is already painted in this layer (used inside cached layers);
 'screen' / 'lighter' = emissive (live). Colours as 'r,g,b' strings or css. */
const rgba = (c, a) => c.startsWith('#') || c.startsWith('rgb') ? c : `rgba(${c},${a})`;
function grad0(g, c, a) { if (c.startsWith('#')) { g.addColorStop(0, c); g.addColorStop(1, c + '00'); } else { g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`); } }
// elliptical light pool (or shade, with a dark colour)
export function pool(ctx, x, y, rx, ry, col, a = 0.5, mode = 'source-atop') {
  ctx.save(); ctx.globalCompositeOperation = mode; if (col.startsWith('#')) ctx.globalAlpha *= a;
  ctx.translate(x, y); ctx.scale(1, ry / rx); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); grad0(g, col, a); ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
}
// polygon filled with a linear gradient (light shafts, window spill); a0 at (x0,y0) → a1 at (x1,y1)
export function shaft(ctx, pts, col, a0, a1, x0, y0, x1, y1, mode = 'source-atop') {
  ctx.save(); ctx.globalCompositeOperation = mode; const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(${col},${a0})`); g.addColorStop(1, `rgba(${col},${a1})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); ctx.restore();
}
// ambient occlusion strip along an edge: side 't'|'b'|'l'|'r' = which edge of the rect is dark
export function ao(ctx, x, y, w, h, side, a = 0.35, col = '14,8,30', mode = 'source-atop') {
  const [x0, y0, x1, y1] = side === 't' ? [x, y, x, y + h] : side === 'b' ? [x, y + h, x, y] : side === 'l' ? [x, y, x + w, y] : [x + w, y, x, y];
  ctx.save(); ctx.globalCompositeOperation = mode; const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
}
// flat cast shadow: the path offset by (dx,dy) in a translucent ink tone
export function castShadow(ctx, fn, dx, dy, col = 'rgba(14,8,30,0.28)') { ctx.save(); ctx.translate(dx, dy); ctx.beginPath(); fn(ctx); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
// rim highlight: crescent of `col` inside the path on the side facing the light (dx,dy = toward the light), then re-ink
export function rimP(ctx, fn, col, dx, dy, lw = 6) {
  ctx.save(); ctx.beginPath(); fn(ctx); ctx.clip(); ctx.beginPath(); ctx.rect(-5000, -5000, 10000, 10000); ctx.save(); ctx.translate(-dx, -dy); fn(ctx); ctx.restore();
  ctx.fillStyle = col; ctx.fill('evenodd'); ctx.restore(); if (lw) { ctx.beginPath(); fn(ctx); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); }
}
// halftone dots clipped to a path (shadow texture)
export function halftoneIn(ctx, fn, col, step = 16, r = 3.5, dir = 'none', bb = [-M, -M, W + 2 * M, H + 2 * M]) { clipTo(ctx, fn, () => halftone(ctx, bb[0], bb[1], bb[2], bb[3], col, step, r, dir)); }
// emissive glow ('screen'), cheap: radial gradient in a box
export function emit(ctx, x, y, r, col, a = 0.5) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, r, col, a); ctx.restore(); }
// screen-space helpers (ignore camera)
export function screenSpace(ctx, fn) { const rs = ctx.canvas.width / W; ctx.save(); ctx.setTransform(rs, 0, 0, rs, 0, 0); fn(ctx); ctx.restore(); }
export function vignette2(ctx, a = 0.4, col = '10,6,25', inner = 0.42) { screenSpace(ctx, (c) => { const g = c.createRadialGradient(W / 2, H * 0.45, H * inner * 0.6, W / 2, H * 0.45, H * 0.78); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }); }
// full-frame colour key: vertical/horizontal gradient composited with mode (overlay/soft-light/multiply/screen)
export function keyGrad(ctx, mode, stops, dir = 'v', a = 1) { screenSpace(ctx, (c) => { c.globalCompositeOperation = mode; c.globalAlpha = a; const g = dir === 'v' ? c.createLinearGradient(0, 0, 0, H) : c.createLinearGradient(0, 0, W, 0); stops.forEach(([k, s]) => g.addColorStop(k, s)); c.fillStyle = g; c.fillRect(0, 0, W, H); }); }
// wall fill with rectangular/arched holes (so the FAR layer shows through and can parallax)
export function holed(ctx, b, holes, draw) { ctx.save(); ctx.beginPath(); ctx.rect(b[0], b[1], b[2] - b[0], b[3] - b[1]); for (const h of holes) h(ctx); ctx.clip('evenodd'); draw(); ctx.restore(); }
export const rectHole = (x, y, w, h) => (c) => { c.moveTo(x, y); c.lineTo(x, y + h); c.lineTo(x + w, y + h); c.lineTo(x + w, y); c.closePath(); };
export const archHole = (x, y, w, h) => (c) => { c.moveTo(x, y + h); c.lineTo(x + w, y + h); c.lineTo(x + w, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, 0, Math.PI, true); c.closePath(); };
// paper fibre / wall texture speckle
export function texture(ctx, x, y, w, h, seed, a = 0.07, n = 220) { speckle(ctx, x, y, w, h, `rgba(255,255,255,${a})`, n, seed, 2.2); speckle(ctx, x, y, w, h, `rgba(14,8,30,${a * 1.3})`, n, seed + 1, 2.2); }
// sky gradient
export function sky(ctx, x, y, w, h, stops) { const g = ctx.createLinearGradient(0, y, 0, y + h); stops.forEach(([k, c]) => g.addColorStop(k, c)); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }

/* ===================== animated ambient props ===================== */
export function clockFace(ctx, x, y, r, t, { rim = '#e6b84a', face = '#fbf7ee', hand = INK, tick = true, hour = 10.2 } = {}) {
  castShadow(ctx, (c) => c.arc(x, y, r + 10, 0, 7), -10, 14);
  circ(ctx, x, y, r + 10, rim, 7); circ(ctx, x, y, r - 4, face, 5);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r0 = i % 3 ? r * 0.82 : r * 0.72; line(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, i % 3 ? 3 : 7, hand); }
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.25, r * 0.6, Math.PI * 1.1, Math.PI * 1.7); ctx.lineTo(x - r * 0.2, y - r * 0.25); ctx.fill(); ctx.restore();
  // hands: second hand ticks with a small overshoot each second
  const sec = Math.floor(t), fr = t - sec, kick = fr < 0.12 ? Math.sin(fr / 0.12 * Math.PI) * 0.06 : 0;
  const sa = ((sec + (tick ? Math.min(1, fr / 0.08) : fr)) / 60) * Math.PI * 2 - Math.PI / 2 + kick;
  const ma = ((hour % 1) * 60 + t / 60) / 60 * Math.PI * 2 - Math.PI / 2, ha = (hour / 12) * Math.PI * 2 - Math.PI / 2;
  line(ctx, x, y, x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5, Math.max(6, r * 0.09), hand);
  line(ctx, x, y, x + Math.cos(ma) * r * 0.74, y + Math.sin(ma) * r * 0.74, Math.max(4, r * 0.06), hand);
  line(ctx, x - Math.cos(sa) * r * 0.18, y - Math.sin(sa) * r * 0.18, x + Math.cos(sa) * r * 0.82, y + Math.sin(sa) * r * 0.82, Math.max(2.5, r * 0.025), '#e2463f');
  circ(ctx, x, y, Math.max(5, r * 0.07), '#e2463f', 3);
}
// curling steam wisps (soft, white) — for mugs/cups
export function wisps(ctx, x, y, t, { n = 3, h = 120, w = 16, a = 0.55, seed = 1, col = '255,255,255' } = {}) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ph = (t * 0.45 + i / n + hash(seed + i) * 0.3) % 1; ctx.beginPath();
    for (let k = 0; k <= 14; k++) { const q = k / 14, yy = y - ph * h * 0.35 - q * h * 0.75, xx = x + (i - (n - 1) / 2) * w * 1.3 + Math.sin(q * 5 + t * 2.4 + i * 2) * w * (0.4 + q); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.strokeStyle = `rgba(${col},${a * Math.sin(ph * Math.PI)})`; ctx.lineWidth = w * (1 - ph * 0.5); ctx.stroke(); }
  ctx.restore();
}
// flame (candles/sconces): flickers deterministically
export function flame(ctx, x, y, s, t, seed = 1, glowA = 0.5) {
  const fl = 1 + 0.16 * Math.sin(t * 13 + seed) + 0.08 * Math.sin(t * 29 + seed * 3), sway = Math.sin(t * 7 + seed) * 4 * s;
  emit(ctx, x, y - 20 * s, 110 * s * fl, '#ffb648', glowA);
  P(ctx, (c) => { c.moveTo(x + sway, y - 44 * s * fl); c.quadraticCurveTo(x + 15 * s, y - 10 * s, x, y); c.quadraticCurveTo(x - 15 * s, y - 10 * s, x + sway, y - 44 * s * fl); }, '#ffd43b', 3 * s);
  P(ctx, (c) => { c.moveTo(x + sway * 0.6, y - 26 * s * fl); c.quadraticCurveTo(x + 7 * s, y - 6 * s, x, y - 2 * s); c.quadraticCurveTo(x - 7 * s, y - 6 * s, x + sway * 0.6, y - 26 * s * fl); }, '#fff6d0', 0);
}
// 4-point twinkle star
export function twinkle(ctx, x, y, s, a = 1, col = '#fff6d6') { if (a <= 0.02 || s <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 22 * s); ctx.quadraticCurveTo(x, y, x + 22 * s, y); ctx.quadraticCurveTo(x, y, x, y + 22 * s); ctx.quadraticCurveTo(x, y, x - 22 * s, y); ctx.quadraticCurveTo(x, y, x, y - 22 * s); ctx.fill(); ctx.restore(); }

/* ===================== small figures (diners, waiters, queue, valet) =====================
 person(ctx, x, y, h, {pose:'stand'|'walk'|'sit'|'tray', face:'f'|'l'|'r', t, seed, sil:'#hex' (flat silhouette), skin, hair, top, bot, act:'glass'|'chat'|'phone'|'eat'|null})
 stand/walk/tray: y = feet.  sit: y = seat height (legs hidden by table drawn after). */
const SKINS = ['#f1c7a0', '#d9a066', '#a8673e', '#7a4528', '#e8b48f', '#c58b5c'], HAIRS = ['#2a1d1a', '#5b3a24', '#d9a441', '#1c1530', '#8a4a2a', '#b8b0a8'];
const TOPS = ['#2a2440', '#8e2340', '#2f6f6a', '#e6b84a', '#3a4a8a', '#f3ead6', '#5e1426', '#3aa060', '#e07b39', '#d96aa0'];
export function person(ctx, x, y, h, o = {}) {
  const R = rng((o.seed || 1) * 7 + 3), s = h / 300, lw = o.lw ?? Math.max(2.5, 5 * s), t = o.t || 0, ph = (o.seed || 1) * 1.37;
  const sil = o.sil, skin = sil || o.skin || SKINS[Math.floor(R() * SKINS.length)], hair = sil || o.hair || HAIRS[Math.floor(R() * HAIRS.length)];
  const top = sil || o.top || TOPS[Math.floor(R() * TOPS.length)], bot = sil || o.bot || ['#2a2440', '#3a3350', '#1f2457', '#5b3b34'][Math.floor(R() * 4)];
  const pose = o.pose || 'stand', dir = o.face === 'l' ? -1 : o.face === 'r' ? 1 : 0, hairStyle = Math.floor(R() * 4);
  const sit = pose === 'sit', walk = pose === 'walk' || pose === 'tray';
  const bob = walk ? Math.abs(Math.sin(t * 7 + ph)) * -6 * s : Math.sin(t * 1.6 + ph) * 2 * s;
  const hipY = sit ? y : y - 120 * s, shY = hipY - 105 * s + bob, headY = shY - 52 * s, headR = 38 * s;
  const limb = (x0, y0, x1, y1, col, w) => { ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 2; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); };
  if (!sit) { const sw = walk ? Math.sin(t * 7 + ph) * 34 * s : 0;
    limb(x - 14 * s, hipY, x - 14 * s + sw, y - 8 * s, bot, 26 * s); limb(x + 14 * s, hipY, x + 14 * s - sw, y - 8 * s, bot, 26 * s);
    ell(ctx, x - 14 * s + sw + dir * 8 * s, y - 4 * s, 20 * s, 10 * s, sil || INK, 0); ell(ctx, x + 14 * s - sw + dir * 8 * s, y - 4 * s, 20 * s, 10 * s, sil || INK, 0); }
  // arms (behind torso for the far arm)
  const act = o.act, cyc = (t * 0.5 + hash(ph)) % 1, lift = act === 'glass' || act === 'eat' ? Math.max(0, Math.sin(cyc * Math.PI * 2)) : 0;
  const armL = [x - 40 * s, shY + 12 * s], armR = [x + 40 * s, shY + 12 * s];
  let hl = [x - 50 * s, shY + 95 * s], hr = [x + 50 * s, shY + 95 * s];
  if (pose === 'tray') hr = [x + 70 * s, shY - 40 * s];
  if (act === 'chat') hl = [x - 70 * s + Math.sin(t * 5 + ph) * 12 * s, shY + 50 * s + Math.sin(t * 4 + ph) * 16 * s];
  if (act === 'phone') hr = [x + 18 * s, shY + 50 * s];
  if (lift) hr = [lerp(x + 50 * s, x + 18 * s, lift), lerp(shY + 80 * s, headY + 20 * s, lift)];
  if (walk && pose !== 'tray') { const sw = Math.sin(t * 7 + ph) * 30 * s; hl = [x - 46 * s - sw, shY + 95 * s]; hr = [x + 46 * s + sw, shY + 95 * s]; }
  limb(armL[0], armL[1], hl[0], hl[1], top, 22 * s);
  // torso
  P(ctx, (c) => c.roundRect(x - 48 * s, shY, 96 * s, hipY - shY + (sit ? 10 * s : 6 * s), [30 * s, 30 * s, 10 * s, 10 * s]), top, lw);
  if (!sil) { clipTo(ctx, (c) => c.roundRect(x - 48 * s, shY, 96 * s, hipY - shY + 10 * s, [30 * s, 30 * s, 10 * s, 10 * s]), () => { ctx.fillStyle = 'rgba(14,8,30,0.22)'; ctx.fillRect(x + 18 * s, shY, 40 * s, 200 * s); });
    if (o.kind === 'waiter') { poly(ctx, [x - 16 * s, shY + 2 * s, x, shY + 30 * s, x + 16 * s, shY + 2 * s], '#fbf7ee', lw * 0.7); poly(ctx, [x - 10 * s, shY + 10 * s, x, shY + 16 * s, x + 10 * s, shY + 10 * s, x + 10 * s, shY + 22 * s, x, shY + 16 * s, x - 10 * s, shY + 22 * s], INK, 0); P(ctx, (c) => c.roundRect(x - 40 * s, shY + 60 * s, 80 * s, hipY - shY - 40 * s, 6 * s), '#fbf7ee', lw * 0.7); }
    if (o.kind === 'valet') { rect(ctx, x - 6 * s, shY + 8 * s, 12 * s, 70 * s, '#e6b84a', 0); for (let i = 0; i < 3; i++) circ(ctx, x + 20 * s, shY + 25 * s + i * 22 * s, 4 * s, '#e6b84a', 0); }
  }
  limb(armR[0], armR[1], hr[0], hr[1], top, 22 * s);
  circ(ctx, hl[0], hl[1], 11 * s, skin, lw * 0.8); circ(ctx, hr[0], hr[1], 11 * s, skin, lw * 0.8);
  if (lift && !sil) { // wine glass / fork at the raised hand
    if (act === 'glass') { P(ctx, (c) => { c.moveTo(hr[0] - 10 * s, hr[1] - 40 * s); c.quadraticCurveTo(hr[0] - 11 * s, hr[1] - 10 * s, hr[0], hr[1] - 10 * s); c.quadraticCurveTo(hr[0] + 11 * s, hr[1] - 10 * s, hr[0] + 10 * s, hr[1] - 40 * s); }, 'rgba(155,27,58,0.85)', lw * 0.6); line(ctx, hr[0], hr[1] - 10 * s, hr[0], hr[1] + 6 * s, lw * 0.6); }
    else line(ctx, hr[0], hr[1], hr[0] - 6 * s, hr[1] - 34 * s, lw * 0.8, '#c3ccd5');
  }
  if (pose === 'tray') { ell(ctx, hr[0], hr[1] - 12 * s, 70 * s, 12 * s, '#d3dbe2', lw * 0.8); P(ctx, (c) => c.arc(hr[0], hr[1] - 20 * s, 34 * s, Math.PI, 0), '#e9eef0', lw * 0.8); circ(ctx, hr[0], hr[1] - 56 * s, 6 * s, '#e9eef0', lw * 0.6); }
  if (act === 'phone' && !sil) { rect(ctx, hr[0] - 10 * s, hr[1] - 30 * s, 22 * s, 38 * s, '#1c1530', lw * 0.5, 4 * s); emit(ctx, hr[0], hr[1] - 14 * s, 60 * s, '#8fd0ff', 0.35); }
  // head
  const hx = x + dir * 4 * s + (act === 'chat' ? Math.sin(t * 3 + ph) * 3 * s : 0);
  circ(ctx, hx, headY, headR, skin, lw);
  if (!sil) { clipTo(ctx, (c) => c.arc(hx, headY, headR, 0, 7), () => { ctx.fillStyle = 'rgba(14,8,30,0.16)'; ctx.beginPath(); ctx.arc(hx + headR * 0.55, headY + headR * 0.2, headR, 0, 7); ctx.fill(); }); }
  // hair
  if (hairStyle === 0) P(ctx, (c) => { c.arc(hx, headY - 4 * s, headR + 2 * s, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(hx, headY - headR * 0.4, hx - headR - 2 * s, headY - 4 * s); }, hair, lw);
  else if (hairStyle === 1) { circ(ctx, hx - dir * 10 * s, headY - headR * 0.95, 16 * s, hair, lw); P(ctx, (c) => { c.arc(hx, headY - 2 * s, headR + 2 * s, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); }, hair, lw); }
  else if (hairStyle === 2) P(ctx, (c) => { c.moveTo(hx - headR - 4 * s, headY + headR * 0.9); c.lineTo(hx - headR - 4 * s, headY - 6 * s); c.arc(hx, headY - 6 * s, headR + 4 * s, Math.PI, 0); c.lineTo(hx + headR + 4 * s, headY + headR * 0.9); c.lineTo(hx + headR * 0.6, headY + headR * 0.9); c.lineTo(hx + headR * 0.7, headY - headR * 0.3); c.lineTo(hx - headR * 0.7, headY - headR * 0.3); c.lineTo(hx - headR * 0.6, headY + headR * 0.9); c.closePath(); }, hair, lw);
  else P(ctx, (c) => { c.arc(hx, headY - 2 * s, headR + 1 * s, Math.PI * 1.15, Math.PI * 1.85); c.closePath(); }, hair, lw);
  if (!sil) { // tiny face
    const ex = hx + dir * 10 * s; const bl = ((t * 30 + (o.seed || 1) * 41) % 110) < 4;
    if (bl) { line(ctx, ex - 13 * s, headY + 2 * s, ex - 5 * s, headY + 2 * s, 2.5 * s); line(ctx, ex + 5 * s, headY + 2 * s, ex + 13 * s, headY + 2 * s, 2.5 * s); }
    else { circ(ctx, ex - 9 * s, headY + 2 * s, 4 * s, INK, 0); circ(ctx, ex + 9 * s, headY + 2 * s, 4 * s, INK, 0); }
    P(ctx, (c) => c.arc(ex, headY + 14 * s, 8 * s, 0.2, Math.PI - 0.2), null, 2.5 * s);
  }
  if (o.kind === 'valet' && !sil) { P(ctx, (c) => c.roundRect(hx - 30 * s, headY - headR - 22 * s, 60 * s, 26 * s, 6 * s), '#8e2340', lw); rect(ctx, hx - 40 * s, headY - headR + 2 * s, 80 * s, 8 * s, INK, 0); }
}

/* ===================== shared props (from v1, some upgraded) ===================== */
/* ---------------- shared props ---------------- */
export function noodleCup(ctx, x, y, s = 1, rot = 0, opt = {}) { // y = bottom
  const w0 = 70 * s, w1 = 52 * s, h = 92 * s, lw = Math.max(3, 5 * s);
  const body = (c) => { c.moveTo(x - w0, y - h); c.lineTo(x + w0, y - h); c.lineTo(x + w1, y); c.lineTo(x - w1, y); c.closePath(); };
  P(ctx, body, opt.col || '#f4efe4', 0);
  clipTo(ctx, body, () => {
    ctx.fillStyle = opt.band || '#e2463f'; ctx.fillRect(x - w0, y - h * 0.72, w0 * 2, h * 0.42);
    ctx.fillStyle = '#ffd43b'; const off = ((rot % 1) + 1) % 1; // label scrolls as the cup turns
    for (let k = -1; k <= 1; k++) { const lx = x - w0 + (off + k) * w0 * 2.2; ctx.beginPath(); ctx.arc(lx + w0 * 0.6, y - h * 0.51, 13 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(lx + w0 * 0.85, y - h * 0.58, w0 * 0.7, 5 * s); ctx.fillRect(lx + w0 * 0.85, y - h * 0.48, w0 * 0.45, 5 * s); ctx.fillStyle = '#ffd43b'; }
    ctx.fillStyle = 'rgba(28,21,48,0.18)'; ctx.fillRect(x + w1 * 0.45, y - h, w0, h);
  });
  P(ctx, body, null, lw);
  // lid
  P(ctx, (c) => c.ellipse(x, y - h, w0 + 4 * s, 13 * s, 0, 0, 7), opt.lid || '#d9dde3', lw);
  if (opt.tab !== false) P(ctx, (c) => { c.moveTo(x + w0 * 0.6, y - h - 4 * s); c.lineTo(x + w0 * 1.25, y - h - 22 * s); c.lineTo(x + w0 * 1.35, y - h - 6 * s); c.closePath(); }, opt.lid || '#d9dde3', lw * 0.8);
}
export function cupTower(ctx, x, y, n, s = 0.75, seed = 1) { const R = rng(seed); for (let i = 0; i < n; i++) noodleCup(ctx, x + (R() - 0.5) * 10 * s, y - i * 100 * s, s, R(), { band: ['#e2463f', '#2f8fd8', '#f08a3c'][i % 3], tab: false }); }
export function plant(ctx, x, y, s = 1, seed = 3, sway = 0) { // sway: radians-ish amount (animate with t)
  const R = rng(seed);
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (R() - 0.5) * 2.2 + sway * (0.6 + 0.4 * Math.sin(i * 1.7)), l = (130 + R() * 120) * s; const ex = x + Math.cos(a) * l, ey = y - 60 * s + Math.sin(a) * l;
    P(ctx, (c) => { c.moveTo(x, y - 60 * s); c.quadraticCurveTo((x + ex) / 2 + 40 * s * Math.cos(a + 1.6), (y + ey) / 2, ex, ey); c.quadraticCurveTo((x + ex) / 2 - 40 * s * Math.cos(a + 1.6), (y + ey) / 2, x, y - 60 * s); }, i % 2 ? '#3f9a62' : '#2f7f50', 4 * s);
    line(ctx, x, y - 60 * s, (x + ex * 2) / 3, (y - 60 * s + ey * 2) / 3, 2 * s, 'rgba(14,8,30,0.35)'); }
  P(ctx, (c) => { c.moveTo(x - 70 * s, y - 90 * s); c.lineTo(x + 70 * s, y - 90 * s); c.lineTo(x + 52 * s, y); c.lineTo(x - 52 * s, y); c.closePath(); }, '#d4693d', 5 * s);
  clipTo(ctx, (c) => { c.moveTo(x - 70 * s, y - 90 * s); c.lineTo(x + 70 * s, y - 90 * s); c.lineTo(x + 52 * s, y); c.lineTo(x - 52 * s, y); c.closePath(); }, () => { ctx.fillStyle = '#b4532d'; ctx.fillRect(x + 20 * s, y - 100 * s, 60 * s, 110 * s); });
  P(ctx, (c) => { c.moveTo(x - 70 * s, y - 90 * s); c.lineTo(x + 70 * s, y - 90 * s); c.lineTo(x + 52 * s, y); c.lineTo(x - 52 * s, y); c.closePath(); }, null, 5 * s);
  rect(ctx, x - 78 * s, y - 104 * s, 156 * s, 22 * s, '#e57a4b', 5 * s, 4);
}
export function frame(ctx, x, y, w, h, fillCol, inner, lw = 6, frameCol = '#f3ead6') {
  box(ctx, x, y, w, h, frameCol, shadeCol(frameCol, -0.18), { side: 'b', sw: 10, lw });
  rect(ctx, x + 14, y + 14, w - 28, h - 28, fillCol, 4);
  if (inner) clipTo(ctx, (c) => c.rect(x + 14, y + 14, w - 28, h - 28), () => inner(x + 14, y + 14, w - 28, h - 28));
}
const SL_COLS = ['#ffd27a', '#ff8a5c', '#9fe3ff', '#ffe9a8'];
function slPt(x0, y0, x1, y1, sag, k) { return [lerp(x0, x1, k), lerp(y0, y1, k) + Math.sin(k * Math.PI) * sag]; }
// static part (wire + sockets + unlit bulbs)
export function stringLightsWire(ctx, x0, y0, x1, y1, sag, N = 16) {
  ctx.beginPath(); for (let i = 0; i <= 40; i++) { const [x, y] = slPt(x0, y0, x1, y1, sag, i / 40); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  for (let i = 1; i < N; i++) { const [x, y] = slPt(x0, y0, x1, y1, sag, i / N); rect(ctx, x - 5, y, 10, 10, '#3a3350', 3, 2); }
}
// animated part: twinkling bulbs + soft emissive glow (each bulb on its own phase; one 'dying' bulb flickers)
export function stringLightsGlow(ctx, x0, y0, x1, y1, sag, t, seed = 1, N = 16, cols = SL_COLS) {
  for (let i = 1; i < N; i++) { const [x, y] = slPt(x0, y0, x1, y1, sag, i / N); const c = cols[i % cols.length];
    let tw = 0.7 + 0.3 * Math.sin(t * 2.3 + i * 1.7 + seed); if (i === 7) tw *= hash(Math.floor(t * 9)) > 0.3 ? 1 : 0.25;
    emit(ctx, x, y + 26, 90, c, 0.38 * tw);
    P(ctx, (cx) => { cx.ellipse(x, y + 24, 11, 16, 0, 0, 7); }, tw > 0.5 ? c : shadeCol(c, -0.35), 4);
    ctx.fillStyle = `rgba(255,255,255,${0.8 * tw})`; ctx.beginPath(); ctx.ellipse(x - 3, y + 19, 3.5, 6, 0.3, 0, 7); ctx.fill(); }
}
export function stringLights(ctx, x0, y0, x1, y1, sag, t, seed = 1, cols = SL_COLS) { stringLightsWire(ctx, x0, y0, x1, y1, sag); stringLightsGlow(ctx, x0, y0, x1, y1, sag, t, seed, 16, cols); }
export function windowBlinds(ctx, x, y, w, h, up, col = '#e3dccb') { // slats covering top `up` fraction
  const bh = h * up; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, bh); ctx.clip();
  for (let yy = y; yy < y + bh; yy += 26) { rect(ctx, x - 4, yy, w + 8, 20, col, 3); ctx.fillStyle = shadeCol(col, -0.15); ctx.fillRect(x, yy + 13, w, 5); }
  ctx.restore(); rect(ctx, x - 10, y + bh - 6, w + 20, 18, shadeCol(col, -0.05), 4, 4);
  line(ctx, x + w - 30, y + bh + 10, x + w - 30, y + bh + 120, 3); circ(ctx, x + w - 30, y + bh + 128, 9, col, 3);
}
export function skyline(ctx, x, y, w, h, seed, t = 0) {
  const R = rng(seed); let xx = x - 20;
  while (xx < x + w) { const bw = 60 + R() * 90, bh = h * (0.25 + R() * 0.6), col = R() < 0.5 ? '#1a2250' : '#222c5e';
    ctx.fillStyle = col; ctx.fillRect(xx, y + h - bh, bw, bh + 4);
    for (let wy = y + h - bh + 16; wy < y + h - 10; wy += 28) for (let wx = xx + 10; wx < xx + bw - 14; wx += 22) if (R() < 0.33) { ctx.fillStyle = R() < 0.8 ? '#ffd27a' : '#9fe3ff'; ctx.fillRect(wx, wy, 10, 14); }
    if (R() < 0.3) { ctx.fillStyle = col; ctx.fillRect(xx + bw / 2 - 3, y + h - bh - 40, 6, 40); circ(ctx, xx + bw / 2, y + h - bh - 42, 5, Math.sin(t * 4) > 0 ? '#ff5d5d' : '#7a2a3a', 0); }
    xx += bw + 4; }
}
export function moon(ctx, x, y, r) { glow(ctx, x, y, r * 3, '#fff3c4', 0.35); circ(ctx, x, y, r, '#f8ecbd', 5); clipTo(ctx, (c) => c.arc(x, y, r, 0, 7), () => { circ(ctx, x + r * 0.45, y + r * 0.2, r * 0.9, '#e8d79c', 0); }); circ(ctx, x - r * 0.3, y - r * 0.25, r * 0.16, '#e2cf8e', 3); circ(ctx, x + r * 0.1, y + r * 0.35, r * 0.11, '#e2cf8e', 3); }
export function stars(ctx, x, y, w, h, n, seed, t = 0) { const R = rng(seed); for (let i = 0; i < n; i++) { const sx = x + R() * w, sy = y + R() * h, s = 2 + R() * 3, tw = 0.5 + 0.5 * Math.sin(t * 2 + i); ctx.globalAlpha = 0.5 + 0.5 * tw; ctx.fillStyle = '#fff6d6'; ctx.fillRect(sx - s / 2, sy - s / 2, s, s); if (s > 4) { ctx.fillRect(sx - s * 1.5, sy - 0.5, s * 3, 1.5); ctx.fillRect(sx - 0.5, sy - s * 1.5, 1.5, s * 3); } } ctx.globalAlpha = 1; }
export function woodFloor(ctx, y0, col = '#5b3b34', sh = '#4b2f2b', seed = 2) {
  ctx.fillStyle = col; ctx.fillRect(-M, y0, W + 2 * M, H + M - y0); const R = rng(seed);
  for (let y = y0, i = 0; y < H + M; y += 70 + i * 6, i++) { ctx.fillStyle = sh; ctx.fillRect(-M, y, W + 2 * M, 5); let x = -M + R() * 200; while (x < W + M) { ctx.fillRect(x, y, 5, 70 + i * 6); x += 260 + R() * 220; } }
}
export function eggSplat(ctx, x, y, r, seed, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  P(ctx, (c) => blobPath(c, 0, 0, r, seed, 11, 0.55), '#fbf6e9', 4);
  const R = rng(seed + 3); for (let i = 0; i < 4; i++) { const a = R() * 7, d = r * (1.1 + R() * 0.5); circ(ctx, Math.cos(a) * d, Math.sin(a) * d, r * (0.08 + R() * 0.1), '#fbf6e9', 3); }
  P(ctx, (c) => blobPath(c, r * 0.1, r * 0.05, r * 0.5, seed + 1, 8, 0.35), '#ffb820', 4);
  circ(ctx, -r * 0.05, -r * 0.12, r * 0.12, '#ffe39a', 0);
  ctx.restore();
}
export function shell(ctx, x, y, s, rot, seed) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const R = rng(seed); poly(ctx, [-14 * s, 0, -8 * s, -10 * s, 0, -4 * s - R() * 6 * s, 8 * s, -12 * s, 15 * s, 0, 0, 8 * s], '#f3ead8', 3); ctx.restore(); }
export function scorch(ctx, x, y, r, seed, a = 1) { ctx.save(); ctx.globalAlpha *= a; P(ctx, (c) => blobPath(c, x, y, r, seed, 12, 0.6), 'rgba(30,22,26,0.75)', 0); P(ctx, (c) => blobPath(c, x, y + r * 0.1, r * 0.6, seed + 5, 10, 0.5), 'rgba(20,14,18,0.8)', 0); ctx.restore(); }
export function puff(ctx, x, y, r, col = '#8d8a99', lw = 5, seed = 1) { // outlined cloud with flat shadow tone + soft inner shading
  const R = rng(seed); const bs = []; for (let i = 0; i < 5; i++) bs.push([x + (R() - 0.5) * r * 1.6, y + (R() - 0.5) * r * 0.6, r * (0.45 + R() * 0.35)]);
  if (lw) { ctx.fillStyle = INK; for (const [bx, by, br] of bs) { ctx.beginPath(); ctx.arc(bx, by, br + lw, 0, 7); ctx.fill(); } }
  ctx.save(); ctx.beginPath(); for (const [bx, by, br] of bs) { ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, 7); } ctx.clip();
  ctx.fillStyle = col; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
  if (col[0] === '#' && col.length === 7) { ctx.fillStyle = shadeCol(col, -0.22); for (const [bx, by, br] of bs) { ctx.beginPath(); ctx.arc(bx + br * 0.28, by + br * 0.42, br * 0.92, 0, 7); ctx.fill(); } }
  const g = ctx.createRadialGradient(x - r * 0.5, y - r * 0.6, r * 0.1, x, y, r * 1.6); g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(0.5, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(14,8,30,0.25)');
  ctx.fillStyle = g; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; for (const [bx, by, br] of bs) { ctx.beginPath(); ctx.arc(bx - br * 0.3, by - br * 0.35, br * 0.38, 0, 7); ctx.fill(); }
  ctx.restore();
}
