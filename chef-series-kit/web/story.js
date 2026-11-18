// Ep1 "Day 1 of 30" timeline. Each shot: {a,b (frames, b exclusive), cam, whip, flash, flashes, draw(ctx, lf, f, lt, len)}
import { W, H, FPS, clamp, lerp, lin, sm, eOut, eBack, hash, glow, vignette } from './util.js';
import { drawBg, drawFg, drawAlarm, KITCHEN, OFFICE } from './bg.js';
import { drawPhone } from './phone.js';
import * as FX from './fx.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1425;
const sec = (f) => f / FPS;

/* ---------- character helpers ---------- */
function blinkAt(f, seed) { const per = 96 + (seed % 5) * 9, ph = (f + seed * 37) % per; return ph < 2 ? 1 : ph < 4 ? 0.5 : 0; }
function C(ctx, name, o, f) {
  const seed = o.seed ?? (name.length * 7);
  drawChar(ctx, name, { view: 'front', pose: 'stand', expr: 'neutral', t: f, look: [0, 0], blink: blinkAt(f, seed), prop: null, seed, ...o });
}
// head metrics relative to feet, measured from the cast's own bounds() so story framing survives a cast swap
function headOf(name, o) {
  try { const b = bounds(name, { view: 'front', pose: 'stand', ...o }); if (b && b.head) return b.head; } catch (e) { }
  return { x: o.x, y: o.y - o.h * 0.83, r: o.h * 0.16 };
}
// place a character so its head centre is at (hx,hy) with radius hr
function place(name, hx, hy, hr, o = {}) {
  const ref = headOf(name, { ...o, x: 0, y: 0, h: 1000 });
  const h = hr / (ref.r / 1000); return { ...o, h, x: hx - ref.x * h / 1000, y: hy - ref.y * h / 1000 };
}
// draw a background zoomed around (fx,fy) independent of character placement
function bgZ(ctx, name, o, s = 1, fx = W / 2, fy = H / 2, fg = false) { ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s); ctx.translate(-fx, -fy); (fg ? drawFg : drawBg)(ctx, name, o); ctx.restore(); }
const NIGHT = { col: '#7f9cff', amt: 0.25, dir: [1, -0.4] };
const say = (t0, t1, text) => ({ text, t0, t1 });

/* ---------- shots ---------- */
export const SHOTS = [
  // ===== 0–114 "Day one. Sam just landed his dream job."
  { a: 0, b: 34, cam: { s: [1, 1.04] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 26, seed: 4 });
    FX.titleCard(ctx, lt, { p: 0.45 + lf / 12, out: lin(28, 34, lf) });
  } },
  { a: 34, b: 66, cam: { s: [1.02, 1.1], f: [470, 820] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const o = { x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, expr: lf < 16 ? 'neutral' : 'confused', look: [0.2, 0.7], light: NIGHT };
    C(ctx, 'SAM', o, f); const hd = headOf('SAM', o);
    FX.phoneGlow(ctx, hd.x + 40, hd.y + hd.r * 1.6, 380, '#8fd0ff', 0.4);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    if (lf > 20) FX.bang(ctx, hd.x + hd.r * 1.3, hd.y - hd.r * 1.1, 0.6, 0.2, '?', '#fff', (lf - 20) / 5);
  } },
  { a: 66, b: 94, cam: { s: [1, 1.05], snap: [{ at: 15, to: 1.12, f: [540, 1000] }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'email', t: lt, time: '11:46', tap: lin(2, 8, lf), open: lin(7, 13, lf), pop: lin(10, 16, lf), hl: lin(15, 24, lf), confetti: lin(12, 20, lf), thumb: lf < 9 ? [420, 560 + (lf < 5 ? 0 : (lf - 5) * 40)] : null, thumbPress: lf > 2 && lf < 6 ? 1 : 0 });
  } },
  { a: 94, b: 114, cam: { shake: [[1, 22, 10]], s: [1.05, 1.0] }, flash: 3, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const jump = Math.sin(clamp(lf / 16) * Math.PI) * 140;
    const o = { x: 520, y: 1720 - jump, h: 1320, pose: 'cheer', prop: 'phone', expr: 'excited', light: NIGHT };
    C(ctx, 'SAM', o, f); const hd = headOf('SAM', o);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    FX.confetti(ctx, lt + 0.5, { n: 50, seed: 2, y0: -400 });
    FX.bang(ctx, hd.x + hd.r * 1.7, hd.y - hd.r * 0.6, 0.9, 0.25, '!!', '#ffd43b', lf / 4);
    FX.impactLines(ctx, hd.x, hd.y, hd.r * 2.1, lt, { n: 12, col: '#ffd43b', lw: 10 });
  } },
  // ===== 114–219 "Assistant chef at Lumière, the fanciest restaurant in the city."
  { a: 114, b: 152, whip: 'r', cam: { s: [1.0, 1.08], f: [540, 820] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_ext', { t: sec(f) });
    FX.sparkle(ctx, 250, 600, 1, lt); FX.sparkle(ctx, 860, 640, 0.8, lt + 1);
  } },
  { a: 152, b: 186, cam: { s: [1.06, 1.06], pan: [-50, 0, 50, 0], ease: 'lin' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) });
    for (let i = 0; i < 5; i++) FX.sparkle(ctx, 200 + i * 170, 300 + (i % 2) * 120, 0.7, lt + i);
  } },
  { a: 186, b: 219, cam: { s: [1.0, 1.06], f: [540, 900] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'lumiere_dining', { t: sec(f) }, 1.4, 540, 600);
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,215,120,0.25)', r0: 380 });
    glow(ctx, 540, 760, 620, '#ffd88a', 0.35);
    C(ctx, 'SAM_CHEF', { x: 540, y: 2050, h: 1700, pose: 'armsCrossed', expr: 'proud', look: [0, -0.2], light: { col: '#ffcf6b', amt: 0.3, dir: [0, -1] } }, f);
    for (let i = 0; i < 6; i++) FX.sparkle(ctx, 140 + i * 160, 260 + hash(i) * 400, 1.1, lt * 1.3 + i);
    FX.tag(ctx, 540, 230, 'ASSISTANT CHEF', { col: '#e6b84a', tcol: '#1c1530', p: lf / 6, rot: -0.04 });
  } },
  // ===== 219–304 "There's one problem. Sam can't cook."
  { a: 219, b: 262, cam: { s: [1.0, 1.06], f: [540, 760], shake: [[19, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const o = { x: 540, y: 1760, h: 1330, pose: lf < 19 ? 'cheer' : 'stand', prop: 'phone', expr: lf < 19 ? 'grin' : 'happy', light: NIGHT };
    C(ctx, 'SAM', o, f); drawFg(ctx, 'apt_night', { t: sec(f) });
    if (lf >= 19) { const hd = headOf('SAM', o); FX.sweatDrop(ctx, hd.x + hd.r * 0.95, hd.y - hd.r * 0.5, 1, lt, (lf - 19) * 2); }
    if (lf >= 19) FX.tint(ctx, '#1c1530', 0.12);
  } },
  { a: 262, b: 304, cam: { snap: [{ at: 10, to: 1.25, dur: 6, f: [540, 760] }], shake: [[21, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d63a3a', col2: '#c93333', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,240,230,0.35)', r0: 520 });
    const o = place('SAM', 540, 760, 300, { pose: 'stand', expr: 'nervous', look: [0, 0] });
    C(ctx, 'SAM', o, f);
    FX.sweatDrop(ctx, o.x + 290, 560, 1.5, lt, Math.min(60, lf * 3)); FX.sweatDrop(ctx, o.x - 300, 620, 1.1, lt, Math.max(0, lf - 14) * 3);
  } },
  // ===== 304–414 "On his résumé he wrote 10 years of fine dining experience."
  { a: 304, b: 392, cam: { s: [1, 1.03], snap: [{ at: 32, to: 1.32, dur: 7, f: [470, 760] }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#d69b2f', pattern: 'dots', t: lt });
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'resume', t: lt, hl: lin(338, 388, f), scroll: 0 });
    if (f > 389) FX.bang(ctx, 860, 600, 0.6, 0.2, '!', '#ff4d4d', (f - 389) / 3);
  } },
  { a: 392, b: 414, cam: { s: [1.08, 1.12] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'stripes', t: lt });
    const o = place('SAM', 560, 820, 280, { pose: 'armsCrossed', expr: 'smug', look: [-0.6, -0.1], view: '34L' });
    C(ctx, 'SAM', o, f);
    FX.sparkle(ctx, 260, 560, 1.2, lt); FX.sparkle(ctx, 850, 480, 0.9, lt + 2); FX.sparkle(ctx, 820, 980, 0.7, lt + 4);
  } },
  // ===== 414–547 "His real experience? Microwaving noodles. Sometimes with the lid still on."
  { a: 414, b: 458, cam: { s: [1.0, 1.08], f: [520, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), micro: lf > 26 });
    C(ctx, 'SAM', { x: 770, y: 1840, h: 1330, pose: lf < 26 ? 'hold' : 'point', prop: lf < 26 ? 'noodlecup' : null, view: '34L', expr: 'happy', look: [-0.8, 0] }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
  } },
  { a: 458, b: 500, cam: { s: [1.0, 1.08], f: [430, 1000] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'microwave_cu', { t: sec(f) });
  } },
  { a: 500, b: 528, cam: { s: [1.1, 1.18], f: [430, 1000], shake: [[19, 16, 9]] }, flashes: [[19, 5, 0.8]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'microwave_cu', { t: sec(f), sparks: lin(8, 20, lf) });
    if (lf >= 19) FX.bang(ctx, 820, 330, 0.8, 0.2, '!!', '#ffd43b', (lf - 19) / 4);
  } },
  { a: 528, b: 547, cam: { snap: [{ at: 0, to: 1.15, dur: 5, f: [540, 760] }] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'apt_kitchen', { t: sec(f), micro: true, sparks: true }, 1.5, 300, 900);
    FX.tint(ctx, '#1c1530', 0.35);
    const fl = 0.5 + 0.5 * Math.abs(Math.sin(f * 1.7));
    const o = place('SAM', 600, 780, 300, { pose: 'stand', expr: 'shock', view: '34L', look: [-0.7, 0.2], light: { col: '#ffd27a', amt: 0.15 + 0.2 * fl, dir: [-1, 0.2] } });
    C(ctx, 'SAM', o, f);
    FX.lightFlicker(ctx, '#9fe3ff', 0.25 * fl);
    FX.sparks(ctx, 60, 900, lt, { n: 12, spread: 300, seed: 3 });
  } },
  // ===== 547–721 interview: "...the head chef only asked one question. 'Can you start in thirty days?'"
  { a: 547, b: 592, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 1100] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'chef_office', { t: sec(f) });
    C(ctx, 'HEADCHEF', { x: 760, y: 1640, h: 1380, pose: 'armsCrossed', expr: 'stern', look: [-0.6, 0.1] }, f);
    drawFg(ctx, 'chef_office', { t: sec(f) });
    const so = { x: 250, y: 1720, h: 1000, pose: 'sit', view: 'sideR', expr: 'nervous', sweat: 1 };
    C(ctx, 'SAM', so, f); const hd = headOf('SAM', so);
    FX.sweatDrop(ctx, hd.x + hd.r * 0.9, hd.y - hd.r * 0.7, 0.8, lt, (lf % 20) * 3);
  } },
  { a: 592, b: 626, cam: { snap: [{ at: 20, to: 1.18, dur: 6, f: [540, 700] }] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'chef_office', { t: sec(f) }, 1.55, 760, 640);
    const o = place('HEADCHEF', 540, 720, 250, { pose: 'armsCrossed', expr: 'stern', look: [0, 0.1] });
    C(ctx, 'HEADCHEF', o, f);
    bgZ(ctx, 'chef_office', { t: sec(f) }, 1.55, 760, 640, true);
    if (lf >= 20) FX.tag(ctx, 540, 260, 'HEAD CHEF', { col: '#fff', tcol: '#1c1530', p: (lf - 20) / 5, rot: 0.05 });
  } },
  { a: 626, b: 676, cam: { s: [1.0, 1.1], f: [540, 800] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'chef_office', { t: sec(f) }, 1.7, 200, 900);
    FX.tint(ctx, '#1c1530', 0.15);
    const o = place('SAM', 520, 820, 290, { pose: 'sit', view: '34R', expr: 'nervous', look: [0.6, -0.1], sweat: 1 });
    C(ctx, 'SAM', o, f);
    FX.sweatDrop(ctx, o.x + 300, 600, 1.4, lt, (lf % 25) * 4); FX.sweatDrop(ctx, o.x - 290, 660, 1.1, lt, ((lf + 12) % 25) * 4);
    if (lf > 18) FX.tag(ctx, 540, 300, 'ONE QUESTION', { col: '#ffd43b', tcol: '#1c1530', p: (lf - 18) / 5, rot: -0.05 });
  } },
  { a: 676, b: 712, cam: { s: [1.0, 1.06], f: [540, 900] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'chef_office', { t: sec(f) }, 1.55, 760, 640);
    const o = place('HEADCHEF', 540, 960, 270, { pose: 'point', expr: 'stern', look: [0, 0.2], say: say(678, 707, 'Can you start in thirty days?') });
    C(ctx, 'HEADCHEF', o, f); const hd = headOf('HEADCHEF', o);
    FX.speechBubble(ctx, { x: 540, y: 330, text: 'Can you start in 30 days?', tx: hd.x - 40, ty: hd.y - hd.r * 2.2, p: (lf - 2) / 6, size: 74, maxW: 820, hi: ['30'] });
  } },
  // ===== 721–829 "Sam said yes. Then he went home… and tried to boil an egg."
  { a: 712, b: 752, cam: { s: [1.0, 1.06], f: [540, 800] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3aa060', col2: '#349456', pattern: 'burst', t: lt, cy: 800 });
    const nod = Math.sin(lf * 0.7) * 0.5 + 0.5;
    const o = place('SAM', 540, 800 + nod * 30, 300, { pose: 'nod', expr: 'excited', look: [0, 0.3 * nod] });
    C(ctx, 'SAM', o, f);
    FX.sweatDrop(ctx, o.x + 320, 520 - lf * 3, 1, lt); FX.sweatDrop(ctx, o.x - 320, 560 - lf * 2.5, 0.9, lt);
    if (lf > 10) FX.tag(ctx, 540, 280, 'YES! YES! YES!', { col: '#fff', tcol: '#2a7d4a', p: (lf - 10) / 5, rot: -0.05, size: 72 });
  } },
  { a: 752, b: 792, whip: 'r', cam: { s: [1.02, 1.02] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f) });
    const x = lerp(-120, 560, eOut(lf / 34));
    C(ctx, 'SAM', { x, y: 1850, h: 1330, pose: lf < 32 ? 'walk' : 'stand', view: lf < 32 ? 'sideR' : 'front', expr: 'happy' }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
  } },
  { a: 792, b: 830, cam: { s: [1.0, 1.1], f: [600, 700] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), burner: 1 });
    FX.steam(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 130, lt, { amt: 0.8 });
    const o = { x: 520, y: 1850, h: 1360, pose: 'holdUp', prop: 'egg', expr: 'smug', look: [0.5, -0.6] };
    C(ctx, 'SAM', o, f); const hd = headOf('SAM', o);
    FX.sparkle(ctx, hd.x + hd.r * 2.0, hd.y - hd.r * 1.4, 1.3, lt); FX.sparkle(ctx, hd.x + hd.r * 2.6, hd.y - hd.r * 0.6, 0.8, lt + 2);
  } },
  // ===== 829–912 "First try? The egg exploded."
  { a: 830, b: 868, cam: { s: [1.0, 1.1], f: [540, 800], shake: [[24, 4, 14]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'stove_cu', { t: sec(f), water: true, rattle: lin(4, 36, lf), boil: 1 });
    FX.steam(ctx, 540, 640, lt, { amt: 1, w: 520, h: 500 });
    FX.tag(ctx, 540, 260, 'TRY #1', { col: '#ffd43b', tcol: '#1c1530', p: lf / 5, size: 90 });
  } },
  { a: 868, b: 892, cam: { shake: [[6, 34, 14]], s: [1.1, 1.0] }, flashes: [[6, 4, 1]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'stove_cu', { t: sec(f), water: true, egg: f < 874, rattle: 1, mess: f >= 878 ? 0.3 : 0 });
    FX.eggBurst(ctx, 570, 690, (f - 874) / FPS, { seed: 5, scale: 1.2, targets: [[200, 260, 70], [880, 420, 60], [520, 140, 80], [120, 900, 50]] });
    if (f >= 874) FX.bang(ctx, 800, 1060, 0.9, 0.12, 'POP!', '#ff4d4d', (f - 874) / 4);
  } },
  { a: 892, b: 912, cam: { snap: [{ at: 0, to: 1.12, dur: 5, f: [540, 760] }] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'apt_kitchen', { t: sec(f), mess: 0.25 }, 1.4, 640, 400);
    const o = place('SAM', 540, 800, 300, { pose: 'stand', expr: 'shock', look: [0, -0.4] });
    C(ctx, 'SAM', o, f); const hd = headOf('SAM', o);
    FX.yolkOnFace(ctx, hd.x + hd.r * 0.35, hd.y - hd.r * 0.55, hd.r * 0.42, 4); FX.yolkOnFace(ctx, hd.x - hd.r * 0.6, hd.y + hd.r * 0.35, hd.r * 0.22, 9);
    FX.yolkOnFace(ctx, hd.x + hd.r * 0.1, hd.y - hd.r * 1.0, hd.r * 0.3, 12);
    ctx.save(); ctx.fillStyle = '#ffb820'; ctx.strokeStyle = '#1c1530'; ctx.lineWidth = 5; const dl = Math.min(120, lf * 8); ctx.beginPath(); ctx.roundRect(hd.x + hd.r * 0.28, hd.y - hd.r * 0.4, 22, dl, 11); ctx.fill(); ctx.stroke(); ctx.restore();
  } },
  // ===== 912–971 "Second try? He forgot the water."
  { a: 912, b: 946, cam: { s: [1.0, 1.08], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'stove_cu', { t: sec(f), water: false, hot: lin(0, 26, lf), mess: 0.3 });
    FX.heatWaves(ctx, 540, 640, lt, 600, 300);
    FX.smoke(ctx, 540, 640, lt, { n: 7, spread: 500, rise: 700, size: 120, seed: 3, alpha: lin(4, 20, lf) });
    FX.tag(ctx, 540, 260, 'TRY #2', { col: '#ff8a3c', tcol: '#1c1530', p: lf / 5, size: 90 });
  } },
  { a: 946, b: 971, cam: { s: [1.08, 1.14], f: [520, 760] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.45, burner: 1 });
    FX.smoke(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 140, lt, { n: 6, spread: 160, rise: 700, size: 90, seed: 7 });
    C(ctx, 'SAM', { x: 400, y: 1850, h: 1360, pose: 'stand', view: '34R', expr: 'deadpan', look: [0.8, 0.5] }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.45 });
  } },
  // ===== 971–1051 "Third try… the smoke alarm texted his mom."
  { a: 971, b: 1000, cam: { s: [1.5, 1.6], f: [540, 960], pan: [160, -60, 0, -600] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7, burner: 1, alarm: lf > 14 });
    FX.smoke(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 120, lt, { n: 10, spread: 260, rise: 900, size: 120, seed: 9, speed: 0.5 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7 });
    drawAlarm(ctx, sec(f), lf > 14);
    if (lf > 16) FX.impactLines(ctx, KITCHEN.alarm[0] + 34, KITCHEN.alarm[1] - 14, 40, lt, { n: 8, col: '#ff4d4d', lw: 6 });
    if (lf < 14) FX.tag(ctx, 700, 520, 'TRY #3', { col: '#ff4d4d', tcol: '#fff', p: lf / 4, size: 60 });
  } },
  { a: 1000, b: 1024, cam: { s: [1.0, 1.04], shake: [[2, 10, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'diag', t: lt });
    glow(ctx, 540, 700, 700, '#ff4d4d', 0.25 + 0.15 * Math.sin(lt * 10));
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'alarm', t: lt, p: lin(1, 7, lf), p2: lin(14, 20, lf) });
  } },
  { a: 1024, b: 1051, cam: { s: [1.0, 1.05], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d96aa0', col2: '#cf5f95', pattern: 'dots', t: lt });
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'texts', t: lt, n: lin(1024, 1029, f) + lin(1032, 1037, f) + lin(1039, 1044, f), typing: f > 1045 });
  } },
  // ===== 1051–1186 "His roommate walks in, looks at the kitchen, and goes, 'Bro… what happened?'"
  { a: 1051, b: 1092, whip: 'l', cam: { s: [1.0, 1.06], f: [520, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
    const x = lerp(560, 520, eOut(lf / 20));
    C(ctx, 'ROOMMATE', { x, y: 1700, h: 1300, pose: lf < 18 ? 'walk' : 'hold', view: 'front', prop: 'grocerybag', expr: lf < 30 ? 'neutral' : 'confused', look: [0.6, 0] }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
  } },
  { a: 1092, b: 1122, cam: { s: [1.12, 1.12], pan: [-80, 0, 80, 0], ease: 'lin' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 1, alarm: true, burner: 1 });
    FX.smoke(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 120, lt, { n: 8, spread: 300, rise: 800, size: 120, seed: 4 });
    C(ctx, 'SAM_SOOT', { x: 420, y: 1830, h: 1150, pose: 'shrug', expr: 'nervous', view: 'front' }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 1 });
  } },
  { a: 1122, b: 1141, cam: { snap: [{ at: 0, to: 1.18, dur: 5, f: [540, 760] }], shake: [[0, 10, 6]] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 }, 1.4, 520, 700);
    const o = place('ROOMMATE', 540, 800, 300, { pose: 'hold', prop: 'grocerybag', expr: 'shock', look: [0, 0] });
    C(ctx, 'ROOMMATE', o, f); const hd = headOf('ROOMMATE', o);
    FX.bang(ctx, hd.x + hd.r * 1.6, hd.y - hd.r * 1.0, 0.8, 0.2, '!?', '#ffd43b', lf / 4);
  } },
  { a: 1141, b: 1186, cam: { s: [1.0, 1.06], f: [540, 900] }, draw(ctx, lf, f, lt) {
    bgZ(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 }, 1.4, 520, 700);
    bgZ(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 }, 1.4, 520, 700, true);
    const o = place('ROOMMATE', 540, 980, 280, { pose: 'shrug', prop: null, expr: f < 1172 ? 'confused' : 'deadpan', look: [0, 0], say: say(1141, 1170, 'Bro… what happened?') });
    C(ctx, 'ROOMMATE', o, f); const hd = headOf('ROOMMATE', o);
    FX.speechBubble(ctx, { x: 540, y: 330, text: 'Bro… what happened?', tx: hd.x + 40, ty: hd.y - hd.r * 1.25, p: (lf - 1) / 6, size: 78, hi: ['BRO'] });
  } },
  // ===== 1186–1245 "Sam says, 'I'm a chef now.'"
  { a: 1186, b: 1211, cam: { s: [1.0, 1.04], snap: [{ at: 6, to: 1.14, dur: 6, f: [540, 700] }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 1, burner: 0.5 });
    const o = { x: 540, y: 1850, h: 1380, pose: 'stand', expr: 'proud', look: [0, -0.2], soot: 1 };
    C(ctx, 'SAM_SOOT', o, f); const hd = headOf('SAM_SOOT', o);
    FX.smoke(ctx, hd.x, hd.y - hd.r * 1.2, lt, { n: 4, spread: 160, rise: 400, size: 60, seed: 5, speed: 0.6 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 1 });
  } },
  { a: 1211, b: 1245, cam: { s: [1.0, 1.05], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt, cy: 980 });
    FX.actionLines(ctx, 540, 980, lt, { col: 'rgba(255,255,255,0.35)', r0: 560 });
    const o = place('SAM_CHEF', 540, 1000, 270, { pose: 'holdUp', prop: 'spatula', expr: 'proud', look: [0, 0], soot: 1, say: say(1211, 1240, "I'm a chef now.") });
    C(ctx, 'SAM_CHEF', o, f); const hd = headOf('SAM_CHEF', o);
    FX.smoke(ctx, hd.x, hd.y - hd.r * 1.4, lt, { n: 3, spread: 200, rise: 300, size: 60, seed: 8, speed: 0.5 });
    FX.speechBubble(ctx, { x: 540, y: 300, text: "I'm a chef now.", tx: hd.x - 60, ty: hd.y - hd.r * 2.6, p: (lf - 1) / 6, size: 82, hi: ['CHEF'] });
    for (let i = 0; i < 4; i++) FX.sparkle(ctx, 140 + i * 260, 560 + (i % 2) * 120, 1, lt + i);
  } },
  // ===== 1245–1305 "Twenty-nine days left."
  { a: 1245, b: 1297, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'calendar', t: lt, p: lin(1248, 1258, f), pill: lin(1256, 1262, f), time: '8:00' });
    if (f >= 1272) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1272, 1278, f)); FX.confetti(ctx, lt, { n: 30, seed: 9 }); FX.daysLeftCard(ctx, lt, (f - 1272) / 8); }
  } },
  // ===== 1297–1425 "So… what should Sam try to cook tomorrow? Comment below."
  { a: 1297, b: LEN, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 1000] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 1, burner: 0.3 });
    FX.tint(ctx, '#1c1530', 0.25);
    const o = { x: 540, y: 1900, h: 1300, pose: f < 1336 ? 'shrug' : 'point', view: 'front', expr: f < 1336 ? 'confused' : 'excited', look: [0, f < 1336 ? -0.6 : 0], soot: 1 };
    C(ctx, 'SAM_SOOT', o, f); const hd = headOf('SAM_SOOT', o);
    FX.smoke(ctx, hd.x, hd.y - hd.r * 1.2, lt, { n: 3, spread: 160, rise: 300, size: 50, seed: 11, speed: 0.5 });
    FX.questionMarks(ctx, hd.x, hd.y - hd.r * 1.6, 1.0 * Math.min(1, lf / 6), lt);
    const opts = [['PANCAKES?', '#ffd43b', '#1c1530', 170, 470, -0.08], ['SPAGHETTI?', '#ff4d4d', '#fff', 820, 560, 0.07], ['TOAST??', '#4fc3f7', '#1c1530', 230, 760, 0.05], ['CEREAL.', '#7ee081', '#1c1530', 850, 820, -0.06]];
    opts.forEach(([t, c, tc, x, y, r], i) => { const at = 1312 + i * 9; if (f >= at) FX.tag(ctx, x, y, t, { col: c, tcol: tc, size: 66, rot: r, p: Math.min(1, (f - at) / 5) }); });
    if (f >= 1300) FX.tag(ctx, 540, 190, 'WHAT SHOULD SAM COOK TOMORROW?', { col: '#ffffff', tcol: '#1c1530', size: 60, rot: -0.02, p: Math.min(1, (f - 1300) / 6) });
    if (f >= 1378) FX.tag(ctx, 540, 1610, 'COMMENT BELOW 👇', { col: '#ff4d4d', tcol: '#fff', size: 84, rot: 0.03, p: Math.min(1, (f - 1378) / 5) });
  } },
];
