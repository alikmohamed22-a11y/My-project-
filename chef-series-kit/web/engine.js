// Engine v2: canvas setup, fonts, story selection (?story=name → story_name.js), camera (see camera.js),
// shot sequencing, transitions (whip with motion blur, smash/impact frames), auto motion/zoom blur, grain, captions.
import { W, H, FPS, clamp, eOut, eInOut, hash, lerp, grain, rng } from './util.js';
import { CAM, camXform, applyCamX, focusAt } from './camera.js';
import { loadCaptions, drawCaptions } from './captions.js';
export { camXform, applyCam } from './camera.js';

const Q = new URLSearchParams(location.search);
const RS = +(Q.get('rs') || 1), NOCAP = Q.get('nocap') === '1', SAFE = Q.get('safe') === '1', STORY = Q.get('story');
const story = await import(STORY ? `./story_${STORY}.js` : './story.js');
const { SHOTS, LEN } = story;
const SLEN = story.STORYLEN || LEN, TM = story.TMAP || null, SEG = story.SEGMAP || null; // SEGMAP: [[out0,out1,src0],...] maps output frames to source(output-time) frames before TMAP
function segmap(f) { if (!SEG) return f; for (const [a, b, s0] of SEG) if (f >= a && f < b) return s0 + (f - a); const l = SEG[SEG.length - 1]; return l[2] + (l[1] - l[0]) - 1; } // optional output->story time map (slowed voice)
function tmap(f) { if (!TM) return f; let i = 0; while (i < TM.length - 2 && f > TM[i + 1][0]) i++; const [a0, b0] = TM[i], [a1, b1] = TM[i + 1]; return b0 + (b1 - b0) * (f - a0) / (a1 - a0); }
const cv = document.createElement('canvas'); cv.width = Math.round(W * RS); cv.height = Math.round(H * RS);
cv.style.cssText = 'display:block;width:100vw;height:auto'; document.body.appendChild(cv);
const ctx = cv.getContext('2d');
const tmp = document.createElement('canvas'); tmp.width = cv.width; tmp.height = cv.height; const tg = tmp.getContext('2d');

export function flash(ctx, a, col = '#fff') { if (a <= 0) return; ctx.save(); ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function streaks(ctx, a, dir, f) { // whip-pan speed streaks
  ctx.save(); ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.globalAlpha = a * 0.5; ctx.fillStyle = '#fff';
  for (let i = 0; i < 40; i++) { const y = hash(i * 3.1 + f) * H, l = 200 + hash(i * 7.7) * 700, x = hash(i * 1.7 + f * 0.3) * W * 1.4 - 200; ctx.fillRect(x - (dir > 0 ? 0 : l), y, l, 2 + hash(i) * 6); }
  ctx.restore();
}
/* ---- post blurs: running average of shifted / scaled copies (deterministic, cheap) ---- */
function snapshot() { tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalAlpha = 1; tg.globalCompositeOperation = 'copy'; tg.drawImage(cv, 0, 0); tg.globalCompositeOperation = 'source-over'; }
function dirBlur(dx, dy, n = 6) { // dx,dy = total smear in frame px
  if (Math.hypot(dx, dy) < 3) return; snapshot(); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 1; i <= n; i++) { const k = i / n - 0.5; ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(tmp, dx * k * RS, dy * k * RS); }
  ctx.restore();
}
function zoomBlur(cx, cy, amt, n = 6) { // amt = relative scale spread (e.g. 0.06)
  if (Math.abs(amt) < 0.006) return; snapshot(); ctx.save();
  for (let i = 1; i <= n; i++) { const s = 1 - amt * i / n; ctx.globalAlpha = 1 / (i + 1); ctx.setTransform(s, 0, 0, s, cx * RS * (1 - s), cy * RS * (1 - s)); ctx.drawImage(tmp, 0, 0); }
  ctx.restore();
}
function impact(type = 'ink', col = '#ff4d4d') { // 1–2 frame impact frame
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (type === 'invert') { ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); }
  else { snapshot(); ctx.filter = 'grayscale(1) contrast(9) brightness(1.15)'; ctx.drawImage(tmp, 0, 0); ctx.filter = 'none';
    if (type === 'red' || type === 'col') { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = col; ctx.fillRect(0, 0, cv.width, cv.height); }
    if (type === 'flat') { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = col; ctx.fillRect(0, 0, cv.width, cv.height); } }
  ctx.restore();
}
/* ---- paper grain: low-frequency fibre texture, multiplied (cached once) ---- */
let _paper = null;
function paper(a = 0.07) {
  if (!_paper) { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 512, 512); const R = rng(17);
    for (let i = 0; i < 260; i++) { const x = R() * 512, y = R() * 512, r = 20 + R() * 70, gr = g.createRadialGradient(x, y, 0, x, y, r); const v = 200 + Math.floor(R() * 40); gr.addColorStop(0, `rgba(${v},${v - 6},${v - 18},0.35)`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    g.strokeStyle = 'rgba(150,130,110,0.25)'; g.lineWidth = 1; for (let i = 0; i < 400; i++) { const x = R() * 512, y = R() * 512, a = R() * 6.28, l = 6 + R() * 18; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l * 0.5, y + Math.sin(a + 1) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    _paper = c; }
  ctx.save(); ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(_paper, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}

/* ---- shots ----
 shot: { a, b, cam, draw(ctx, lf, f, lt, len), whip:'l'|'r', flash:n, flashes:[[at,dur,alpha,col]],
         impact: n | {at=0, n=2, type:'ink'|'invert'|'red'|'flat', col}, smash:true (impact at the cut), mblur:false } */
function drawShot(sh, f, idx) {
  const lf = f - sh.a, len = sh.b - sh.a, c = sh.cam || {};
  ctx.save(); const x = camXform(c, lf, len); applyCamX(ctx, x);
  if (sh.breathe !== false) { const u = lf / Math.max(1, len), k = 1 + 0.028 * u, dx = Math.sin(lf * 0.045 + sh.a) * 3.2, dy = Math.cos(lf * 0.037 + sh.a * 0.7) * 2.4; ctx.translate(W / 2 + dx, H * 0.45 + dy); ctx.scale(k, k); ctx.translate(-W / 2, -H * 0.45); } // always-on slow push + drift (no frozen holds)
  CAM.cur = { spec: c, lf, len, x, x0: camXform(c, 0, len), base: ctx.getTransform(), id: `${idx}:${sh.a}`, rs: RS, focus: focusAt(c, lf) };
  try { sh.draw(ctx, lf, f, lf / FPS, len); } finally { CAM.cur = null; ctx.restore(); }
  return x;
}
const WHIP = 7;
function frame(fo) {
  fo = clamp(Math.round(fo), 0, LEN - 1); let f = TM ? clamp(tmap(segmap(fo)), 0, SLEN - 1) : fo;
  ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
  if (TM) { const j = SHOTS.findIndex((s) => f >= s.a && f < s.b); if (j > 0 && f - SHOTS[j].a < 1) f = SHOTS[j].a; } // land exactly on cut frames
  const i = SHOTS.findIndex((s) => f >= s.a && f < s.b); const idx = i < 0 ? SHOTS.length - 1 : i; const sh = SHOTS[idx];
  const lf = f - sh.a, c = sh.cam || {};
  if (sh.whip && lf < WHIP && idx > 0) { // whip-pan: old shot flies out, new flies in, with directional motion blur
    const e = eInOut(lf / WHIP), dir = sh.whip === 'l' ? -1 : 1, prev = SHOTS[idx - 1];
    ctx.save(); ctx.translate(-dir * e * W, 0); drawShot(prev, prev.b - 1, idx - 1); ctx.restore();
    ctx.save(); ctx.translate(dir * (1 - e) * W, 0); drawShot(sh, f, idx); ctx.restore();
    const v = Math.sin(e * Math.PI); dirBlur(-dir * v * 260, 0, 7); streaks(ctx, v, dir, f);
  } else {
    const x = drawShot(sh, f, idx);
    if (c.mblur !== false && sh.mblur !== false && lf > 0) { // automatic camera motion blur (snap/crash zooms, fast trucks/tilts)
      const p = camXform(c, lf - 1, sh.b - sh.a), dz = Math.log(x.s / p.s);
      const dpx = -(x.px - p.px) * x.s, dpy = -(x.py - p.py) * x.s;
      if (Math.abs(dz) > 0.012) zoomBlur(x.fx + x.sx, x.fy + x.sy, clamp(dz * 1.4, -0.12, 0.12));
      else if (Math.hypot(dpx, dpy) > 18) dirBlur(clamp(dpx * 0.6, -150, 150), clamp(dpy * 0.6, -150, 150));
    }
  }
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  const im = sh.impact ?? (sh.smash ? { n: 2 } : null);
  if (im) { const o = typeof im === 'number' ? { n: im } : im; const at = o.at || 0; if (lf >= at && lf < at + (o.n || 2)) impact(o.type || 'ink', o.col); }
  if (sh.flash) flash(ctx, 1 - lf / sh.flash);
  for (const fl of sh.flashes || []) if (lf >= fl[0]) flash(ctx, (1 - (lf - fl[0]) / (fl[1] || 4)) * (fl[2] || 1), fl[3]);
  paper(0.08); grain(ctx, 0.06);
  if (!NOCAP && story.CAPTIONS !== false) drawCaptions(ctx, fo);
  if (SAFE) { ctx.save(); ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.fillStyle = 'rgba(255,0,80,0.28)'; ctx.fillRect(0, H * 0.78, W, H * 0.22); ctx.fillStyle = 'rgba(255,0,80,0.15)'; ctx.fillRect(W * 0.86, H * 0.45, W * 0.14, H * 0.33); ctx.fillStyle = '#fff'; ctx.font = '700 30px Inter'; ctx.fillText('IG UI ZONE', 30, H * 0.78 + 40); ctx.restore(); }
}

window.renderFrame = (f) => { const t0 = performance.now(); frame(f); return performance.now() - t0; };
window.LEN = LEN;
(async () => {
  const anton = new FontFace('Anton', 'url(Anton-Regular.ttf)'); const lg = new FontFace('Luckiest', 'url(LuckiestGuy-Regular.ttf)');
  await Promise.all([anton.load(), lg.load()]); document.fonts.add(anton); document.fonts.add(lg);
  for (const fam of ['400 20px Inter', '700 20px Inter', '800 20px Inter', 'bold italic 20px FreeSerif', '20px "Noto Color Emoji"']) { try { await document.fonts.load(fam, 'Aa😳'); } catch (e) { } }
  await document.fonts.ready;
  await loadCaptions(story.CAPCONF || {});
  frame(+(Q.get('f') || 0));
  window.ready = true;
})();
