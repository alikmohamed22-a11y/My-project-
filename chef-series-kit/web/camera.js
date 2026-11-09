// Camera v2: deterministic camera math, per-layer parallax, focus (rack) blur, offscreen helpers.
// The engine sets CAM.cur for the shot being drawn; bg layers and FX read it.
import { W, H, clamp, lerp, eOut, eIn, eInOut, eBack, hash } from './util.js';

export const CAM = { cur: null };
const EASE = { io: eInOut, out: eOut, in: eIn, lin: (x) => clamp(x), back: eBack };
// smooth deterministic 1-D noise (sum of incommensurate sines), range ~[-1,1]
export function noise1(t, seed = 0) { return Math.sin(t * 1.73 + seed * 3.1) * 0.5 + Math.sin(t * 2.91 + seed * 1.37) * 0.3 + Math.sin(t * 5.27 + seed * 7.7) * 0.2; }
// damped spring 0→1 with overshoot `over` (fraction) and settle; x = time/dur
export function spring(x, over = 0.1) {
  if (x <= 0) return 0; if (over <= 0) return eOut(x);
  const k = -Math.log(over) * 9 / Math.PI; return 1 - Math.exp(-k * x) * Math.cos(9 * x);
}

/* cam spec (all optional, all times in shot-local frames):
  s:[s0,s1]  zoom over the shot (dolly; parallax automatic)    f:[x,y] focus point     ease:'io'|'lin'|'out'
  pan:[x0,y0,x1,y1]  world offset over the shot (truck = x, tilt = y)
  moves:[{at,dur,dx,dy,ds,f,ease}]   keyframed cumulative moves: truck (dx), tilt (dy, negative = look up), dolly (ds multiplier)
  snap:[{at,to,dur=6,f,over=0.08}]    snap-zoom with overshoot + settle
  crash:[{at,to,dur=3,f}]             crash zoom (fast ease-in, auto zoom-blur)
  shake:[[at,amt,frames,rot]]         decaying shake, rot = radians (default amt*0.0009)
  drift: px                           handheld micro-drift (seeded smooth noise), driftSeed
  rack:[{at,dur=10,to:'bg'|'char',amt=9}]  rack focus; focus0:'bg'|'char' start state; bgBlur: constant shallow-DOF blur
  parallax:false                      disable layer parallax for this shot
  mblur:false                         disable automatic motion/zoom blur                                         */
export function camXform(c = {}, lf, len) {
  const k = len > 1 ? lf / (len - 1) : 0, kk = (EASE[c.ease] || eInOut)(k);
  let s = c.s ? lerp(c.s[0], c.s[1], kk) : 1; let [fx, fy] = c.f || [W / 2, H / 2];
  let px = 0, py = 0; if (c.pan) { px = lerp(c.pan[0], c.pan[2], kk); py = lerp(c.pan[1], c.pan[3], kk); }
  for (const m of c.moves || []) {
    const e = (EASE[m.ease] || eInOut)((lf - m.at) / (m.dur || 12));
    px += (m.dx || 0) * e; py += (m.dy || 0) * e; if (m.ds) s *= lerp(1, m.ds, e);
    if (m.f) { const ee = clamp(e); fx = lerp(fx, m.f[0], ee); fy = lerp(fy, m.f[1], ee); }
  }
  for (const sn of c.snap || []) { if (lf < sn.at) continue; const x = (lf - sn.at) / (sn.dur || 6); const e = spring(x, sn.over ?? 0.08);
    s *= lerp(1, sn.to, e); if (sn.f) { const ee = clamp(eOut(x)); fx = lerp(fx, sn.f[0], ee); fy = lerp(fy, sn.f[1], ee); } }
  for (const cr of c.crash || []) { if (lf < cr.at) continue; const x = clamp((lf - cr.at) / (cr.dur || 3)); const e = x * x;
    s *= lerp(1, cr.to, e); if (cr.f) { fx = lerp(fx, cr.f[0], x); fy = lerp(fy, cr.f[1], x); } }
  let sx = 0, sy = 0, rot = 0;
  for (const [at, amt, fr, ra] of c.shake || []) { if (lf >= at && lf < at + fr) { const d = Math.pow(1 - (lf - at) / fr, 1.5);
    sx += (hash(lf * 1.3 + at) * 2 - 1) * amt * d; sy += (hash(lf * 2.7 + at + 9) * 2 - 1) * amt * d; rot += (hash(lf * 4.1 + at + 3) * 2 - 1) * (ra ?? amt * 0.0009) * d; } }
  if (c.drift) { const tt = lf / 30, sd = c.driftSeed || 1; sx += noise1(tt * 0.9, sd) * c.drift; sy += noise1(tt * 0.75, sd + 5) * c.drift * 0.8; rot += noise1(tt * 0.6, sd + 11) * c.drift * 0.0005; }
  return { s, fx, fy, px, py, sx, sy, rot };
}
export function applyCamX(ctx, x) { ctx.translate(x.fx + x.sx, x.fy + x.sy); if (x.rot) ctx.rotate(x.rot); ctx.scale(x.s, x.s); ctx.translate(-x.fx - x.px, -x.fy - x.py); }
export function applyCam(ctx, c, lf, len) { const x = camXform(c, lf, len); applyCamX(ctx, x); return x; }

// focus state: blur (world px) for background layers and for characters
export function focusAt(c = {}, lf) {
  let bg = c.focus0 === 'char' ? 0 : 0, ch = 0;
  if (c.focus0 === 'char') { bg = c.rackAmt ?? 9; }
  if (c.focus0 === 'bg') { ch = c.rackAmt ?? 9; }
  for (const r of c.rack || []) { if (lf < r.at) continue; const e = eInOut((lf - r.at) / (r.dur || 10)), a = r.amt ?? 9;
    const [tb, tc] = r.to === 'bg' ? [0, a] : [a, 0]; bg = lerp(bg, tb, e); ch = lerp(ch, tc, e); }
  return { bg: bg + (c.bgBlur || 0), char: ch };
}

/* ---- parallax: correction transform for a layer at depth d (1 = character plane, 0 = infinity) ----
   Parallax comes only from camera MOTION: at shot frame 0 every layer lines up exactly as authored. */
export function layerCorr(d) {
  const C = CAM.cur; if (!C || C.spec.parallax === false || d === 1) return null;
  const x = C.x, x0 = C.x0; const S = x.s, S0 = x0.s;
  const Sd = S0 * (1 + (S / S0 - 1) * d), pxd = x0.px + (x.px - x0.px) * d, pyd = x0.py + (x.py - x0.py) * d;
  return new DOMMatrix().translate(x.fx + x.px, x.fy + x.py).scale(Sd / S).translate(-x.fx - pxd, -x.fy - pyd);
}
// matrix for layer d at an arbitrary shot frame (for cache region estimation): RS * cam(lf) * corr
export function layerMatAt(d, lf) {
  const C = CAM.cur; const x = camXform(C.spec, lf, C.len), x0 = C.x0; const S0 = x0.s;
  const p = C.spec.parallax === false ? 1 : d;
  const Sd = S0 * (1 + (x.s / S0 - 1) * p), pxd = x0.px + (x.px - x0.px) * p, pyd = x0.py + (x.py - x0.py) * p;
  return new DOMMatrix().scale(C.rs, C.rs).translate(x.fx + x.sx, x.fy + x.sy).rotate(x.rot * 180 / Math.PI).scale(Sd, Sd).translate(-x.fx - pxd, -x.fy - pyd);
}

/* ---- offscreen scratch canvases (pooled by nesting depth) ---- */
const POOL = []; let depth = 0;
function scratch(w, h) { let c = POOL[depth]; if (!c) { c = document.createElement('canvas'); POOL[depth] = c; } if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return c; }
// draw fn() into an offscreen copy with the same transform, then composite with a CSS filter (e.g. 'blur(6px)')
export function withFilter(ctx, filter, fn, alpha = 1) {
  if (!filter) { fn(ctx); return; }
  const cv = ctx.canvas, c = scratch(cv.width, cv.height), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.setTransform(ctx.getTransform());
  g.save(); depth++; try { fn(g); } finally { depth--; g.restore(); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = filter; ctx.globalAlpha = alpha; ctx.drawImage(c, 0, 0); ctx.restore();
}
// blur in WORLD px (converted with the current transform scale)
export function blurred(ctx, px, fn) { const m = ctx.getTransform(), sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)); const b = px * sc; if (b < 0.6) { fn(ctx); return; } withFilter(ctx, `blur(${b.toFixed(2)}px)`, fn); }
// draw a character (or anything on the character plane) honouring the shot's rack-focus state
export function charFocus(ctx, fn) { const f = CAM.cur ? CAM.cur.focus.char : 0; blurred(ctx, f, fn); }
