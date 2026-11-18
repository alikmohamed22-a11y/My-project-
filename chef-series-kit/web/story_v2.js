// Ep1 v2 timeline ("Day 1 of 30", new script). Select with ?story=v2. 30 fps, LEN 1638 (mix_v2.wav 54.6 s).
// Shot: {a,b,cam,whip,smash,impact,flashes,draw(ctx,lf,f,lt,len)}. Characters use cast v2 (t/say in FRAMES).
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash, P, ell, line, circ, glow } from './util.js';
import { drawBg, drawFg, drawAlarm, KITCHEN, OFFICE, LUMEXT, MONTAGE, eggSplat } from './bg.js';
import { drawPhone } from './phone.js';
import * as FX from './fx.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1638;
export const CAPCONF = {
  file: 'words_v2.json',
  keyY: ['LUMIÈRE', 'TWO', 'YEARS', "CAN'T", 'COOK', '10', 'TECHNICALLY', 'FOUR', 'MINUTES', 'ONE', '30', 'OUI', 'FRENCH', 'EGG', 'WATER', 'MOM', 'BRO', 'CEILING', 'CHEF', '29', 'COMMENT'],
  keyR: ['EXPLODED'],
  quotes: [[712, 757], [777, 794], [1306, 1382], [1444, 1475]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers ---------------- */
const k01 = (f, a, b) => clamp((f - a) / (b - a));
const io = (f, a, b) => eInOut(k01(f, a, b));
// expression change with brow lead (cast cross-fades using exprT)
const ex = (f, at, from, to) => (f < at ? { expr: from } : { exprPrev: from, expr: to, exprT: f - at });
const ex2 = (f, at1, e0, e1, at2, e2) => (f < at2 ? ex(f, at1, e0, e1) : ex(f, at2, e1, e2));
// pose tween with easing
const ptw = (f, at, dur, from, to) => ({ pose: from, pose2: to, mix: io(f, at, at + dur) });
// anticipation squash → jump → landing squash (big reactions). returns rig fields
function hop(f, at, { jump = 140, up = 14, sq = 0.22 } = {}) {
  const a = f - at; if (a < 0) return { squash: 0, jump: 0 };
  let squash = 0, j = 0;
  if (a < 5) squash = sq * Math.sin(a / 5 * Math.PI / 2);
  else if (a < 8) squash = lerp(sq, -0.2, (a - 5) / 3);
  else if (a < 5 + up) squash = lerp(-0.2, 0, (a - 8) / Math.max(1, up - 3));
  else if (a < 9 + up) squash = 0.18 * Math.sin((a - 5 - up) / 4 * Math.PI);
  if (a >= 5 && a <= 5 + up) j = jump * Math.sin((a - 5) / up * Math.PI);
  return { squash, jump: j };
}
// small take: squash pop without leaving the ground
function take(f, at, amt = 0.16) { const a = f - at; if (a < 0 || a > 12) return 0; return a < 3 ? -amt * (a / 3) : amt * 0.7 * Math.sin((a - 3) / 9 * Math.PI) * (1 - (a - 3) / 9); }
function blinkAt(f, seed) { const per = 96 + (seed % 5) * 9, ph = (f + seed * 37) % per; return ph < 2 ? 1 : ph < 4 ? 0.5 : 0; }
// draw a character from a per-frame options function (track passes the same function so secondary motion sees easing)
function CH(ctx, name, fn, f) {
  const o = fn(f), seed = o.seed ?? name.length * 7;
  drawChar(ctx, name, { view: 'front', pose: 'stand', expr: 'neutral', look: [0, 0], blink: blinkAt(f, seed), seed, shadow: true, ...o, t: f, track: (t) => fn(t) });
  return o;
}
function headOf(name, o) { try { const b = bounds(name, { view: 'front', pose: 'stand', ...o }); if (b && b.head) return b.head; } catch (e) { } return { x: o.x, y: o.y - o.h * 0.83, r: o.h * 0.16 }; }
function place(name, hx, hy, hr, o = {}) { const ref = headOf(name, { ...o, x: 0, y: 0, h: 1000 }); const h = hr / (ref.r / 1000); return { ...o, h, x: hx - ref.x * h / 1000, y: hy - ref.y * h / 1000 }; }
const NIGHT = { col: '#7f9cff', amt: 0.22, dir: [1, -0.4] }, DAY = { col: '#ffd9a0', amt: 0.12, dir: [1, -0.5] }, GOLD = { col: '#ffcf6b', amt: 0.25, dir: [0, -1] };
const say = (t0, t1, text) => ({ text, t0, t1 });
function beret(ctx, hd, drop) { // beret falling onto a head (drop 0→1)
  const y = hd.y - hd.r * 0.95 - (1 - eOut(clamp(drop))) * 700, bounce = drop > 0.8 ? Math.sin((drop - 0.8) / 0.2 * Math.PI) * 10 : 0;
  ctx.save(); ctx.translate(hd.x - hd.r * 0.15, y - bounce); ctx.rotate(-0.25 + (1 - clamp(drop)) * 0.8);
  P(ctx, (c) => c.ellipse(0, 0, hd.r * 1.05, hd.r * 0.38, 0, 0, 7), '#1c1530', 9); P(ctx, (c) => c.ellipse(-hd.r * 0.15, -hd.r * 0.1, hd.r * 0.8, hd.r * 0.22, 0, Math.PI, 0), '#3a3350', 0); line(ctx, 6, -hd.r * 0.36, 12, -hd.r * 0.58, 10); ctx.restore();
}
const tagTop = (ctx, text, p, o = {}) => FX.tag(ctx, o.x ?? 540, o.y ?? 230, text, { col: '#ffd43b', tcol: INK, size: 84, rot: -0.04, p, ...o });

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–33 "Day one,"
  { a: 0, b: 33, cam: { s: [1, 1.06], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 30, seed: 4 });
    FX.titleCard(ctx, lt, { p: 0.4 + lf / 10, out: lin(28, 33, lf) });
  } },
  // ===== 33–58 "Sam just got hired" — Sam on the phone at night, ding at 48 → take
  { a: 33, b: 58, cam: { s: [1.04, 1.16], f: [470, 820], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const A = (t) => ({ x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, 49, 'neutral', 'shock'), look: [0.2, 0.7], light: NIGHT, rim: 'cool', rig: { squash: take(t, 48, 0.14), headNod: t < 49 ? 0.2 : -0.3 * io(t, 49, 54) } });
    CH(ctx, 'SAM', A, f); const hd = headOf('SAM', A(f));
    FX.phoneGlow(ctx, hd.x + 40, hd.y + hd.r * 1.6, 380, '#8fd0ff', 0.4);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    if (f >= 49) { FX.bang(ctx, hd.x + hd.r * 1.4, hd.y - hd.r * 1.2, 0.7, 0.2, '!', '#ffd43b', (f - 49) / 4); FX.impactLines(ctx, hd.x, hd.y, hd.r * 1.9, lt, { n: 10, col: '#ffd43b', lw: 8 }); }
  } },
  // ===== 58–98 email insert: "You're hired!" (assistant chef at Lumière)
  { a: 58, b: 98, cam: { s: [1, 1.04], snap: [{ at: 12, to: 1.12, f: [540, 900], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'email', t: lt, time: '11:46', tap: lin(1, 5, lf), open: lin(4, 10, lf), pop: lin(9, 15, lf), hl: lin(14, 26, lf), confetti: lin(12, 20, lf), thumb: lf < 7 ? [420, 560 + (lf < 3 ? 0 : (lf - 3) * 40)] : null, thumbPress: lf > 0 && lf < 4 ? 1 : 0 });
    if (lf > 14) FX.sparkle(ctx, 860, 300, 1.1, lt); if (lf > 18) FX.sparkle(ctx, 210, 1180, 0.9, lt + 1);
  } },
  // ===== 98–120 cheer jump (anticipation → jump → land)
  { a: 98, b: 120, cam: { s: [1.06, 1.0], f: [520, 860], shake: [[8, 18, 8]] }, flashes: [[7, 3, 0.5]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const A = (t) => ({ x: 520, y: 1760, h: 1220, ...ptw(t, 99, 6, 'phone', 'cheer'), prop: 'phone', ...ex(t, 99, 'shock', 'excited'), light: NIGHT, rim: 'cool', rig: hop(t, 100, { jump: 170, up: 15 }) });
    const o = CH(ctx, 'SAM', A, f); const hd = headOf('SAM', o);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    FX.confetti(ctx, lt + 0.5, { n: 50, seed: 2, y0: -400 });
    if (lf >= 6) { FX.bang(ctx, hd.x + hd.r * 1.7, hd.y - hd.r * 0.6, 0.9, 0.25, '!!', '#ffd43b', (lf - 6) / 4); FX.impactLines(ctx, hd.x, hd.y, hd.r * 2.1, lt, { n: 12, col: '#ffd43b', lw: 10 }); }
    if (lf >= 5 && lf < 12) FX.motionLines(ctx, hd.x, hd.y + hd.r * 3, 0, -1, { n: 5, len: 160, spread: 300, t: lt, col: '#fff' });
    if (lf >= 18) FX.dustPuff(ctx, 520, 1720, (lf - 18) / 10, { col: '#c9bc9e' });
  } },
  // ===== 120–152 "the fanciest restaurant" — Lumière exterior, whip in, truck
  { a: 120, b: 152, whip: 'r', cam: { s: [1.02, 1.1], pan: [100, 30, -40, 30], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_ext', { t: sec(f) }); drawFg(ctx, 'lumiere_ext', { t: sec(f) });
    FX.sparkle(ctx, 250, 650, 1, lt); FX.sparkle(ctx, 860, 690, 0.8, lt + 1);
  } },
  // ===== 152–178 "in the city" — dining room dolly
  { a: 152, b: 178, cam: { s: [1.0, 1.12], f: [540, 760], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) + 3 }); drawFg(ctx, 'lumiere_dining', { t: sec(f) + 3 });
    for (let i = 0; i < 5; i++) FX.sparkle(ctx, 200 + i * 170, 300 + (i % 2) * 120, 0.7, lt + i);
  } },
  // ===== 178–247 "The waitlist is two years long." — truck along the queue, snap to the A-board on the ting (210)
  { a: 178, b: 247, cam: { s: [1.12, 1.12], f: [620, 1300], moves: [{ at: 0, dur: 28, dx: -160, ease: 'out' }], snap: [{ at: 31, to: 1.75, f: [285, 1350], dur: 7, over: 0.12 }], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_ext', { t: sec(f) });
    drawFg(ctx, 'lumiere_ext', { t: sec(f) });
    if (f >= 210) { FX.impactLines(ctx, LUMEXT.board[0], LUMEXT.board[1] - 30, 190, lt, { n: 12, col: '#ffd43b', lw: 6 }); FX.sparkle(ctx, LUMEXT.board[0] + 120, LUMEXT.board[1] - 140, 0.9, lt); }
    if (f >= 222) FX.tag(ctx, 300, 1050, '…FOR A TABLE', { col: '#fff', tcol: INK, size: 46, rot: 0.05, p: (f - 222) / 5 });
  } },
  // ===== 247–296 "There's just one problem" — fantasy: Sam the star chef; record scratch (296) freezes it
  { a: 247, b: 296, cam: { s: [1.0, 1.1], f: [540, 900], bgBlur: 2 }, impact: { at: 47, n: 2, type: 'invert' }, flashes: [[47, 4, 0.3]], draw(ctx, lf, f, lt) {
    const fz = Math.min(f, 293); // freeze on the scratch
    drawBg(ctx, 'lumiere_dining', { t: sec(fz) });
    FX.actionLines(ctx, 540, 760, sec(fz), { col: 'rgba(255,215,120,0.22)', r0: 420 });
    const A = (t) => ({ x: 540, y: 2050, h: 1700, ...ptw(t, 250, 8, 'stand', 'proudChest'), ...ex(t, 262, 'proud', 'smug'), light: GOLD, rim: 'warm', rig: { headTilt: 6 * io(t, 262, 270), squash: take(t, 250, 0.1) } });
    CH(ctx, 'SAM_CHEF', A, fz);
    drawFg(ctx, 'lumiere_dining', { t: sec(fz) });
    for (let i = 0; i < 6; i++) FX.sparkle(ctx, 140 + i * 160, 260 + hash(i) * 400, 1.1, sec(fz) * 1.3 + i);
    FX.tag(ctx, 540, 230, 'ASSISTANT CHEF', { col: '#e6b84a', tcol: '#1c1530', p: lf / 6, rot: -0.04 });
    if (lf >= 46) { FX.tint(ctx, '#1c1530', 0.35); FX.tag(ctx, 540, 1180, '*RECORD SCRATCH*', { col: '#ff4d4d', tcol: '#fff', size: 60, rot: 0.06, p: (lf - 46) / 3 }); }
  } },
  // ===== 296–333 "Sam can't cook," — snap-zoom on the frozen smile
  { a: 296, b: 333, cam: { snap: [{ at: 7, to: 1.28, dur: 6, f: [540, 760], over: 0.15 }], shake: [[8, 16, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d63a3a', col2: '#c93333', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,240,230,0.35)', r0: 520 });
    const A = (t) => place('SAM', 540, 760, 300, { ...ex(t, 304, 'grin', 'nervous'), look: [0, 0], rig: { squash: take(t, 304, 0.12), headTilt: -4 * io(t, 306, 316) } });
    const o = CH(ctx, 'SAM', A, f);
    FX.sweatDrop(ctx, o.x + 290, 560, 1.5, lt, Math.min(60, Math.max(0, lf - 8) * 3)); FX.sweatDrop(ctx, o.x - 300, 620, 1.1, lt, Math.max(0, lf - 16) * 3);
  } },
  // ===== 333–372 "like… at all." — Sam vigorously stirring an EMPTY pot
  { a: 333, b: 372, cam: { s: [1.08, 1.16], pan: [-40, 0, 30, 0], f: [600, 900], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), burner: 0 });
    const A = (t) => ({ x: 470, y: 1850, h: 1330, view: '34R', pose: 'stir', prop: 'spatula', ...ex(t, 352, 'determined', 'proud'), light: DAY, rig: { bodyLean: 4 * Math.sin(t * 0.6) } });
    CH(ctx, 'SAM', A, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.motionLines(ctx, 700, 860, 1, 0, { n: 3, len: 60, spread: 80, t: lt, lw: 5 });
    if (lf > 14) FX.tag(ctx, 800, 640, "IT'S EMPTY.", { col: '#fff', tcol: INK, size: 54, rot: 0.08, p: (lf - 14) / 5 });
    if (lf > 22) { line(ctx, 790, 690, 720, 830, 7); P(ctx, (c) => { c.moveTo(706, 852); c.lineTo(704, 812); c.lineTo(740, 830); c.closePath(); }, INK, 0); }
  } },
  // ===== 372–472 résumé insert — phone whooshes in (369), highlighter 402–452
  { a: 372, b: 472, cam: { s: [1, 1.03], snap: [{ at: 32, to: 1.3, dur: 7, f: [470, 760], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#d69b2f', pattern: 'dots', t: lt });
    const py = lerp(1900, 120, eBack(k01(lf, 0, 9)));
    if (lf < 5) FX.motionLines(ctx, 540, py + 300, 0, -1, { n: 6, len: 300, spread: 600, t: lt, col: '#fff' });
    drawPhone(ctx, { x: 150, y: py, w: 780, h: 1180, rot: (1 - k01(lf, 0, 9)) * 0.15, state: 'resume', t: lt, hl: lin(402, 452, f), scroll: 0 });
    if (f > 453) FX.bang(ctx, 860, 600, 0.6, 0.2, '!', '#ff4d4d', (f - 453) / 3);
  } },
  // ===== 472–528 "which is technically true." — smirk, ting (504) glint
  { a: 472, b: 528, cam: { s: [1.06, 1.16], pan: [30, 0, -30, 0], f: [560, 820], bgBlur: 5 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const A = (t) => place('SAM', 560, 820, 280, { pose: 'armsCrossed', view: '34L', ...ex(t, 488, 'neutral', 'smirk'), look: [-0.6, -0.1], light: NIGHT, rim: 'warm', rig: { headTilt: 8 * io(t, 488, 500), headTurn: -0.2 * io(t, 494, 504) } });
    const o = CH(ctx, 'SAM', A, f); const hd = headOf('SAM', o);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    if (f >= 503) { const k = k01(f, 503, 515); FX.sparkle(ctx, hd.x - hd.r * 0.25, hd.y + hd.r * 0.45, 1.4 * Math.sin(k * Math.PI), lt); }
    FX.sparkle(ctx, 260, 560, 1.0, lt); FX.sparkle(ctx, 850, 480, 0.8, lt + 2);
    if (f >= 506) FX.tag(ctx, 540, 260, '(KIND OF)', { col: '#fff', tcol: INK, size: 60, rot: -0.05, p: (f - 506) / 5 });
  } },
  // ===== 528–594 "He's been eating at restaurants for ten years." — vintage photos, clinks 534/556/579
  ...[[528, 550, 2015, 'happy'], [550, 572, 2018, 'grin'], [572, 594, 2021, 'excited']].map(([a, b, year, e], i) => ({ a, b, smash: i > 0, impact: i > 0 ? { n: 1, type: 'flat', col: '#ffd43b' } : undefined, cam: { s: [1.03, 1.1], f: [540, 820], drift: 3, driftSeed: i + 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'montage', { t: sec(f), year });
    const { x, y, hr } = MONTAGE.sam;
    const A = (t) => place('SAM', x, y, hr, { pose: 'sit', expr: e, talk: 0.7, look: [0.1 * Math.sin(t * 0.3), 0.3], rig: { headNod: 0.25 * Math.sin(t * 0.9), headTilt: 5 * Math.sin(t * 0.25 + i) } });
    MONTAGE.clip(ctx, () => CH(ctx, 'SAM', A, f));
    drawFg(ctx, 'montage', { t: sec(f), year });
    const clink = [534, 556, 579][i]; if (f >= clink) FX.sparkle(ctx, [800, 860, 840][i], [1000, 980, 960][i], 1.2 * Math.sin(k01(f, clink, clink + 10) * Math.PI), lt);
  } })),
  // ===== 594–612 "The interview…" — office wide: chef glares, Sam sweats
  { a: 594, b: 612, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 1100], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'chef_office', { t: sec(f) });
    CH(ctx, 'HEADCHEF', (t) => ({ x: 760, y: 1640, h: 1380, pose: 'armsCrossed', expr: 'stern', look: [-0.6, 0.1], rig: { headTurn: -0.3, bodyLean: -3 } }), f);
    const S = (t) => ({ x: 250, y: 1720, h: 1000, pose: 'sit', view: 'sideR', expr: 'nervous', sweat: 1, rig: { headTurn: -0.6 * io(t, 600, 606) } });
    drawFg(ctx, 'chef_office', { t: sec(f), timer: '0:00' });
    const o = CH(ctx, 'SAM', S, f); const hd = headOf('SAM', o);
    FX.sweatDrop(ctx, hd.x + hd.r * 0.9, hd.y - hd.r * 0.7, 0.8, lt, (lf % 20) * 3);
  } },
  // ===== 612–655 "took four minutes." — stopwatch insert, ticks 612–642, then DING
  { a: 612, b: 655, cam: { s: [2.15, 2.3], f: [560, 1170], bgBlur: 6, shake: [[30, 10, 10]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'chef_office', { t: sec(f) });
    const v = Math.round(lerp(0, 240, eIn(k01(f, 613, 642)) * 0.4 + k01(f, 613, 642) * 0.6));
    drawFg(ctx, 'chef_office', { t: sec(f) * 6, timer: v, ring: f >= 642 ? 1 : 0 });
    if (f >= 642) FX.boom(ctx, 560, 820, 'DING!', (f - 642) / 6, { size: 90, col: '#fff', burst: '#3aa060', rot: -0.1, t: lt });
  } },
  // ===== 655–712 "The head chef asked one question," — leans in, ONE finger on "one" (678)
  { a: 655, b: 712, cam: { s: [1.0, 1.12], f: [540, 780], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'chef_office', { t: sec(f) });
    const A = (t) => place('HEADCHEF', 540, 760 + 20 * io(t, 660, 672), 260, { ...ptw(t, 674, 6, 'armsCrossed', 'point'), view: '34L', ...ex(t, 676, 'stern', 'smirk'), rig: { bodyLean: 8 * io(t, 660, 672) - 4 * io(t, 672, 676) + 4 * io(t, 676, 684), headTilt: -5 * io(t, 680, 690), squash: take(t, 676, 0.08) } });
    CH(ctx, 'HEADCHEF', A, f);
    drawFg(ctx, 'chef_office', { t: sec(f), lamp: false });
    if (f >= 680) FX.tag(ctx, 540, 250, 'ONE QUESTION', { col: '#ffd43b', tcol: '#1c1530', p: (f - 680) / 5, rot: -0.05 });
  } },
  // ===== 712–757 "Can you start in thirty days?"
  { a: 712, b: 757, cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 15, to: 1.12, f: [540, 820], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'chef_office', { t: sec(f) });
    const A = (t) => place('HEADCHEF', 540, 960, 270, { pose: 'point', expr: 'stern', look: [0, 0.2], say: say(712, 740, 'Can you start in thirty days?'), rig: { headNod: 0.2 * Math.sin(t * 0.4), bodyLean: 5 } });
    const o = CH(ctx, 'HEADCHEF', A, f); const hd = headOf('HEADCHEF', o);
    drawFg(ctx, 'chef_office', { t: sec(f), lamp: false });
    FX.speechBubble(ctx, { x: 540, y: 330, text: 'Can you start in 30 days?', tx: hd.x - 40, ty: hd.y - hd.r * 2.2, p: (lf - 1) / 6, size: 74, maxW: 820, hi: ['30'] });
  } },
  // ===== 757–790 "Sam said, 'Oui.'" — gulp, then confident; a beret drops onto his head on the ting (777)
  { a: 757, b: 790, cam: { s: [1.0, 1.06], f: [540, 820], bgBlur: 4, snap: [{ at: 20, to: 1.08, f: [540, 760], dur: 5 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'chef_office', { t: sec(f) });
    const A = (t) => place('SAM', 540, 820, 280, { pose: 'sit', view: '34R', ...ex2(t, 762, 'nervous', 'blank', 768, 'determined'), say: say(770, 785, 'Wee.'), look: [0.5, 0], rig: { squash: take(t, 764, 0.12), headNod: t < 768 ? 0.3 * io(t, 762, 766) : 0.3 - 0.5 * io(t, 768, 772), headTilt: 6 * io(t, 772, 780) } });
    const o = CH(ctx, 'SAM', A, f); const hd = headOf('SAM', o);
    drawFg(ctx, 'chef_office', { t: sec(f), lamp: false });
    if (f >= 762 && f < 770) FX.sweatDrop(ctx, hd.x + hd.r * 1.1, hd.y - hd.r * 0.6, 1, lt, (f - 762) * 5);
    FX.speechBubble(ctx, { x: 760, y: 380, text: 'Oui.', tx: hd.x + hd.r * 0.6, ty: hd.y - hd.r * 1.3, p: (f - 770) / 5, size: 96 });
    if (f >= 777) { beret(ctx, hd, k01(f, 777, 784)); if (f >= 783) FX.sparkle(ctx, hd.x + hd.r * 0.9, hd.y - hd.r * 1.3, 1.1, lt); }
  } },
  // ===== 790–836 "Sam does not speak French." — OUI card, stamp slams on the bonk (822)
  { a: 790, b: 836, cam: { s: [1, 1.05], shake: [[32, 16, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'oui_card', { t: sec(f) });
    FX.ouiCard(ctx, lt, { p: lf / 8 });
    FX.stamp(ctx, 540, 1150, '', (f - 815) / 20, { lines: ['SAM DOES NOT', 'SPEAK FRENCH'], size: 72, t: lt });
    if (f > 822) FX.dustPuff(ctx, 540, 1260, (f - 822) / 14, { col: '#f6efe0', spread: 420 });
  } },
  // ===== 836–910 "So he went home to practice." — walk-in (truck follows), turns to camera, salute on "practice"
  { a: 836, b: 910, whip: 'r', cam: { s: [1.04, 1.08], pan: [-160, 0, 0, 0], f: [540, 900], ease: 'out', drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f) });
    const A = (t) => { const w = k01(t, 836, 868); const turn = io(t, 866, 873);
      return { x: lerp(-180, 520, eOut(w)), y: 1850, h: 1330, pose: t < 868 ? 'walk' : 'stand', ...(t >= 872 ? ptw(t, 874, 5, 'stand', 'salute') : {}), view: lerp(Math.PI / 2, 0, turn), ...ex(t, 872, 'happy', 'determined'), light: DAY, rig: { squash: take(t, 874, 0.12), headTilt: -4 * io(t, 878, 886) } }; };
    const o = CH(ctx, 'SAM', A, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 876) FX.tag(ctx, 540, 300, 'PRACTICE MODE', { col: '#3aa060', tcol: '#fff', size: 66, rot: -0.04, p: (f - 876) / 5 });
    if (f >= 868 && f < 880) FX.dustPuff(ctx, o.x, 1850, (f - 868) / 12, { col: '#e8dfcf', size: 50 });
  } },
  // ===== 910–946 "Step one: boil an egg." — crackEgg over the pot
  { a: 910, b: 946, cam: { s: [1.05, 1.2], f: [640, 880], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), burner: 1 });
    FX.steam(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 130, lt, { amt: 0.8 });
    const A = (t) => ({ x: 470, y: 1850, h: 1330, view: '34R', ...ptw(t, 912, 6, 'holdUp', 'crackEgg'), prop: 'egg', ...ex(t, 914, 'proud', 'determined'), light: DAY, rig: { bodyLean: 6 * io(t, 930, 940), squash: take(t, 938, 0.08) } });
    CH(ctx, 'SAM', A, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    tagTop(ctx, 'STEP 1: BOIL AN EGG', lf / 5, { size: 64 });
  } },
  // ===== 946–990 egg close-up: rattle builds… POP (973)
  { a: 946, b: 990, cam: { s: [1.0, 1.08], f: [540, 800], shake: [[0, 3, 27], [27, 36, 14]] }, impact: { at: 27, n: 2, type: 'invert' }, flashes: [[29, 4, 0.5]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'stove_cu', { t: sec(f), water: true, egg: f < 973, rattle: lin(946, 972, f), boil: 1, mess: f >= 980 ? 0.3 : 0 });
    if (f < 973) FX.steam(ctx, 540, 640, lt, { amt: 1, w: 520, h: 500 });
    FX.eggBurst(ctx, 570, 690, (f - 973) / FPS, { seed: 5, scale: 1.2, targets: [[200, 260, 70], [880, 420, 60], [520, 140, 80], [120, 900, 50]] });
    if (f >= 973) FX.boom(ctx, 760, 1130, 'POP!', (f - 973) / 8, { col: '#fff', burst: '#ff4d4d', rot: 0.1, t: lt, size: 160 });
  } },
  // ===== 990–1015 Sam with egg on his face
  { a: 990, b: 1015, cam: { snap: [{ at: 0, to: 1.12, dur: 5, f: [540, 760] }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.25, ceilingEgg: true });
    const A = (t) => place('SAM', 540, 800, 300, { expr: 'shock', look: [0, -0.4], light: DAY, rig: { squash: take(t, 990, 0.14) } });
    const o = CH(ctx, 'SAM', A, f); const hd = headOf('SAM', o);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.25 });
    FX.yolkOnFace(ctx, hd.x + hd.r * 0.35, hd.y - hd.r * 0.55, hd.r * 0.42, 4); FX.yolkOnFace(ctx, hd.x - hd.r * 0.6, hd.y + hd.r * 0.35, hd.r * 0.22, 9);
    FX.yolkDrip(ctx, hd.x + hd.r * 0.42, hd.y - hd.r * 0.35, hd.r * 0.12, lf / FPS * 1.5, 3);
    FX.sparkle(ctx, hd.x + hd.r * 1.3, hd.y - hd.r * 1.1, 0.5 * Math.max(0, Math.sin(lt * 4)), lt);
  } },
  // ===== 1015–1054 "Step two: he tried again" — new egg, extra confident
  { a: 1015, b: 1054, cam: { s: [1.0, 1.08], f: [600, 760], drift: 2, snap: [{ at: 26, to: 1.1, f: [600, 700], dur: 5 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.3, burner: 1, ceilingEgg: true });
    const A = (t) => ({ x: 520, y: 1850, h: 1360, ...ptw(t, 1036, 6, 'stand', 'holdUp'), prop: 'egg', ...ex(t, 1036, 'determined', 'smug'), look: [0.5, -0.6], light: DAY, soot: 0.2, rig: hop(t, 1035, { jump: 60, up: 10, sq: 0.14 }) });
    const o = CH(ctx, 'SAM', A, f); const hd = headOf('SAM', o);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.3 });
    FX.yolkOnFace(ctx, hd.x + hd.r * 0.35, hd.y - hd.r * 0.55, hd.r * 0.3, 4);
    tagTop(ctx, 'STEP 2: AGAIN', lf / 5, { size: 64, col: '#ff8a3c' });
    if (f >= 1042) { FX.sparkle(ctx, hd.x + hd.r * 2.0, hd.y - hd.r * 1.4, 1.3, lt); FX.sparkle(ctx, hd.x + hd.r * 2.6, hd.y - hd.r * 0.6, 0.8, lt + 2); }
  } },
  // ===== 1054–1092 "…and forgot the water." — dry pot glows, hiss (1086)
  { a: 1054, b: 1092, cam: { s: [1.0, 1.12], f: [540, 900], shake: [[32, 8, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'stove_cu', { t: sec(f), water: false, hot: lin(1058, 1086, f), mess: 0.3 });
    FX.heatWaves(ctx, 540, 640, lt, 600, 300);
    FX.smoke(ctx, 540, 640, lt, { n: 7, spread: 500, rise: 700, size: 120, seed: 3, alpha: lin(1066, 1084, f) });
    if (f >= 1060) FX.tag(ctx, 540, 300, 'WATER: 0%', { col: '#4fc3f7', tcol: INK, size: 80, rot: -0.05, p: (f - 1060) / 5 });
    if (f >= 1086) FX.boom(ctx, 760, 1120, 'TSSSS!', (f - 1086) / 6, { size: 110, col: '#fff', burst: '#ff8a3c', t: lt });
  } },
  // ===== 1092–1111 Sam's deadpan stare (smoke drifting past)
  { a: 1092, b: 1111, cam: { s: [1.08, 1.14], f: [520, 760] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.45, burner: 1, ceilingEgg: true });
    FX.smoke(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 140, lt, { n: 6, spread: 160, rise: 700, size: 90, seed: 7 });
    CH(ctx, 'SAM', (t) => ({ x: 400, y: 1850, h: 1360, view: '34R', expr: 'deadpan', look: [0.8, 0.5], light: DAY, soot: 0.4, rig: { headTurn: 0.2 * io(t, 1096, 1104) } }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.45 });
  } },
  // ===== 1111–1150 "Step three: the smoke alarm went off" — fanning the alarm, tilt up to it
  { a: 1111, b: 1150, cam: { s: [1.05, 1.12], f: [540, 900], moves: [{ at: 18, dur: 14, dy: -380, ease: 'io' }], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7, burner: 1, alarm: f >= 1134, ceilingEgg: true });
    FX.smoke(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 120, lt, { n: 10, spread: 260, rise: 900, size: 120, seed: 9, speed: 0.5 });
    CH(ctx, 'SAM_SOOT', (t) => ({ x: 560, y: 1850, h: 1300, pose: 'fanSmoke', prop: 'towel', ...ex(t, 1134, 'determined', 'panic'), look: [0, -0.8], rig: { squash: take(t, 1134, 0.1) } }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7 });
    if (f >= 1134) { FX.impactLines(ctx, KITCHEN.alarm[0] + 34, KITCHEN.alarm[1] - 14, 50, lt, { n: 8, col: '#ff4d4d', lw: 7 }); FX.boom(ctx, 790, 470, 'BEEP!', ((f - 1134) % 12) / 5, { size: 80, col: '#fff', burst: '#ff4d4d', t: lt }); }
    tagTop(ctx, 'STEP 3', lf / 5, { x: 280, y: 280, col: '#ff4d4d', tcol: '#fff', size: 70 });
  } },
  // ===== 1150–1180 "…so long" — the alarm, and the smart-home notification
  { a: 1150, b: 1180, cam: { s: [1.9, 2.05], f: [540, 196], pan: [0, -260, 0, -260], shake: [[0, 6, 30]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7, alarm: true, ceilingEgg: true });
    FX.smoke(ctx, 300, 500, lt, { n: 6, spread: 600, rise: 500, size: 90, seed: 13, alpha: 0.8 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7 });
    drawAlarm(ctx, sec(f), true); FX.impactLines(ctx, KITCHEN.alarm[0], KITCHEN.alarm[1] - 20, 90, lt, { n: 10, col: '#ff4d4d', lw: 7 });
    FX.tint(ctx, '#ff2a2a', Math.floor(sec(f) * 4) % 2 ? 0.16 : 0);
    FX.notifBanner(ctx, { app: 'HomeGuard', title: 'Smoke detected — Kitchen', body: 'Notifying emergency contact: Mom', p: (f - 1154) / 7, y: 120 });
  } },
  // ===== 1180–1203 "it texted his mom." — Mom gets the buzz (1188)
  { a: 1180, b: 1203, whip: 'l', cam: { s: [1.05, 1.12], f: [540, 800], shake: [[8, 10, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d96aa0', col2: '#cf5f95', pattern: 'dots', t: lt });
    const A = (t) => place('MOM', 540, 760, 260, { pose: 'typing', prop: 'phone', phoneGlow: 1, ...ex(t, 1189, 'neutral', 'shock'), rig: { squash: take(t, 1188, 0.16), headNod: -0.4 * io(t, 1189, 1193) } });
    const o = CH(ctx, 'MOM', A, f); const hd = headOf('MOM', o);
    if (f >= 1189) { FX.bang(ctx, hd.x + hd.r * 1.5, hd.y - hd.r * 1.1, 0.8, 0.2, '!?', '#ffd43b', (f - 1189) / 4); FX.impactLines(ctx, hd.x, hd.y, hd.r * 1.9, lt, { n: 10, col: '#fff', lw: 8 }); }
    FX.tag(ctx, 540, 230, 'MOM', { col: '#fff', tcol: '#d6453d', size: 70, rot: -0.04, p: lf / 4 });
  } },
  // ===== 1203–1224 Mom's texts
  { a: 1203, b: 1224, cam: { s: [1.0, 1.05], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'diag', t: lt });
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'texts', t: lt, n: lin(1203, 1207, f) + lin(1209, 1213, f) + lin(1215, 1219, f), typing: f > 1220 });
  } },
  // ===== 1224–1262 "His roommate walks in" — through the door (creak 1221), toward camera
  { a: 1224, b: 1262, whip: 'r', cam: { s: [1.0, 1.08], f: [520, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
    const A = (t) => { const w = k01(t, 1224, 1250); return { x: 520 + Math.sin(t * 0.33) * 14 * (1 - w), y: lerp(1500, 1730, eInOut(w)), h: lerp(820, 1340, eInOut(w)), pose: t < 1250 ? 'walk' : 'hold', prop: 'grocerybag', view: 'front', ...ex(t, 1252, 'neutral', 'confused'), look: [0, 0], rig: { squash: take(t, 1250, 0.08) } }; };
    CH(ctx, 'ROOMMATE', A, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
  } },
  // ===== 1262–1285 "looks around" — head turns left… right…
  { a: 1262, b: 1285, cam: { s: [1.0, 1.04], f: [540, 800] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
    const A = (t) => place('ROOMMATE', 540, 800, 290, { pose: 'hold', prop: 'grocerybag', expr: 'confused', rig: { headTurn: -0.8 * io(t, 1263, 1268) + 1.6 * io(t, 1272, 1278), headTilt: 6 * io(t, 1274, 1282) }, look: [lerp(-0.8, 0.8, io(t, 1272, 1278)), 0] });
    CH(ctx, 'ROOMMATE', A, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
  } },
  // ===== 1285–1306 "and goes," — wide: the destroyed kitchen, Sam's sheepish wave
  { a: 1285, b: 1306, cam: { s: [1.12, 1.12], pan: [-70, 0, 70, 0], ease: 'lin' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 1, alarm: true, burner: 1, ceilingEgg: true });
    FX.smoke(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 120, lt, { n: 8, spread: 300, rise: 800, size: 120, seed: 4 });
    CH(ctx, 'SAM_SOOT', (t) => ({ x: 420, y: 1830, h: 1150, pose: 'shrug', expr: 'grin', view: '34L', rig: { headTilt: 6 * Math.sin(t * 0.5), shoulderR: 140 + 20 * Math.sin(t * 0.8) } }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 1 });
  } },
  // ===== 1306–1382 "Bro… why is there an egg on the ceiling?" — deadpan, points up on "ceiling" (1358)
  { a: 1306, b: 1382, cam: { s: [1.0, 1.08], f: [540, 900], snap: [{ at: 52, to: 1.08, dur: 5, f: [540, 820] }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
    const A = (t) => place('ROOMMATE', 540, 980, 280, { ...ptw(t, 1352, 6, 'hold', 'lookUp'), prop: t < 1352 ? 'grocerybag' : null, ...ex2(t, 1306, 'confused', 'deadpan', 1352, 'blank'), say: say(1306, 1370, 'Bro… why is there an egg on the ceiling?'), rig: { headTilt: -6 * io(t, 1324, 1334), headNod: -0.3 * io(t, 1354, 1360) } });
    const o = CH(ctx, 'ROOMMATE', A, f); const hd = headOf('ROOMMATE', o);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
    FX.speechBubble(ctx, { x: 540, y: 330, text: 'Bro… why is there an egg on the ceiling?', tx: hd.x + 40, ty: hd.y - hd.r * 1.25, p: (lf - 1) / 6, size: 70, maxW: 900, hi: ['BRO', 'EGG', 'CEILING'] });
    if (f >= 1358) { const k = k01(f, 1358, 1366); line(ctx, 900, 820, 900, 820 - 160 * eOut(k), 12); P(ctx, (c) => { c.moveTo(870, 820 - 150 * eOut(k)); c.lineTo(900, 780 - 160 * eOut(k)); c.lineTo(930, 820 - 150 * eOut(k)); c.closePath(); }, INK, 0); }
  } },
  // ===== 1382–1412 "Sam looks up," — TILT UP to the egg on the ceiling (yolk drip 1392)
  { a: 1382, b: 1412, cam: { moves: [{ at: 2, dur: 10, dy: -1150, ease: 'io' }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f) + 0.984, mess: 0.7, ceilingEgg: true });
    CH(ctx, 'SAM_SOOT', (t) => ({ x: 540, y: 1850, h: 1330, ...ptw(t, 1382, 4, 'stand', 'lookUp'), expr: 'blank' }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7 });
  } },
  // ===== 1412–1444 "Sam looks back down." — bonk (1411), blank stare; the yolk drop lands on his head (1426)
  { a: 1412, b: 1444, smash: true, impact: { n: 1, type: 'flat', col: '#fff6c4' }, cam: { s: [1.02, 1.08], f: [540, 760], shake: [[14, 10, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7, ceilingEgg: true });
    const A = (t) => place('SAM_SOOT', 540, 780, 300, { expr: 'blank', look: [0, 0], rig: { squash: take(t, 1426, 0.18), headNod: t < 1414 ? -0.5 * (1 - io(t, 1412, 1414)) : 0 } });
    const o = CH(ctx, 'SAM_SOOT', A, f); const hd = headOf('SAM_SOOT', o);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 0.7 });
    if (f < 1426) { const yy = lerp(-120, hd.y - hd.r * 1.1, eIn(k01(f, 1417, 1426))); if (f >= 1417) P(ctx, (c) => { c.moveTo(hd.x + 20, yy - 50); c.quadraticCurveTo(hd.x + 46, yy, hd.x + 20, yy + 20); c.quadraticCurveTo(hd.x - 6, yy, hd.x + 20, yy - 50); }, '#ffb820', 6); }
    else { eggSplat(ctx, hd.x + 20, hd.y - hd.r * 1.0, hd.r * 0.42 * (1 + 0.2 * Math.max(0, 1 - (f - 1426) / 4)), 51, 0.3); FX.yolkDrip(ctx, hd.x + hd.r * 0.3, hd.y - hd.r * 0.75, hd.r * 0.1, (f - 1426) / FPS * 1.3, 7); if (f < 1434) FX.boom(ctx, hd.x - hd.r * 1.5, hd.y - hd.r * 1.2, 'PLIP', (f - 1426) / 4, { size: 70, burst: null, col: '#ffd43b', t: lt }); }
  } },
  // ===== 1444–1475 "I'm a chef now." — proud chest, too-big toque
  { a: 1444, b: 1475, cam: { s: [1.0, 1.04], snap: [{ at: 6, to: 1.12, dur: 6, f: [540, 760], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt, cy: 900 });
    FX.actionLines(ctx, 540, 900, lt, { col: 'rgba(255,255,255,0.35)', r0: 560 });
    const A = (t) => place('SAM_CHEF', 540, 960, 260, { ...ptw(t, 1445, 6, 'stand', 'proudChest'), expr: 'proud', soot: 1, say: say(1444, 1462, "I'm a chef now."), rim: 'warm', rig: hop(t, 1444, { jump: 40, up: 8, sq: 0.1 }) });
    const o = CH(ctx, 'SAM_CHEF', A, f); const hd = headOf('SAM_CHEF', o);
    FX.smoke(ctx, hd.x, hd.y - hd.r * 1.4, lt, { n: 3, spread: 200, rise: 300, size: 60, seed: 8, speed: 0.5, wisps: false });
    FX.speechBubble(ctx, { x: 540, y: 290, text: "I'm a chef now.", tx: hd.x - 60, ty: hd.y - hd.r * 2.6, p: (lf - 1) / 6, size: 82, hi: ['CHEF'] });
    for (let i = 0; i < 4; i++) FX.sparkle(ctx, 140 + i * 260, 560 + (i % 2) * 120, 1, lt + i);
  } },
  // ===== 1475–1523 "Twenty-nine days left." — calendar, bonk (1488) → 29 DAYS LEFT card
  { a: 1475, b: 1523, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[13, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { x: 150, y: 120, w: 780, h: 1180, state: 'calendar', t: lt, p: lin(1476, 1484, f), pill: lin(1482, 1488, f), time: '8:00' });
    if (f >= 1488) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1488, 1493, f)); FX.confetti(ctx, lt, { n: 30, seed: 9 }); FX.daysLeftCard(ctx, lt, (f - 1488) / 8); }
  } },
  // ===== 1523–1638 "So… what should Sam try to cook tomorrow? Comment below."
  { a: 1523, b: LEN, whip: 'l', cam: { s: [1.0, 1.08], f: [540, 900], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 1, burner: 0.3, ceilingEgg: true });
    const A = (t) => ({ x: 540, y: 1900, h: 1250, ...(t < 1588 ? ptw(t, 1526, 6, 'stand', 'shrug') : ptw(t, 1588, 5, 'shrug', 'point')), view: 'front', ...ex(t, 1588, 'confused', 'excited'), look: [t < 1588 ? 0.4 * Math.sin(t * 0.15) : 0, t < 1588 ? -0.6 : 0.6], soot: 1, rig: { headTilt: 6 * Math.sin(t * 0.12), squash: take(t, 1589, 0.14) } });
    const o = CH(ctx, 'SAM_SOOT', A, f); const hd = headOf('SAM_SOOT', o);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 1 });
    FX.smoke(ctx, hd.x, hd.y - hd.r * 1.2, lt, { n: 3, spread: 160, rise: 300, size: 50, seed: 11, speed: 0.5, wisps: false });
    if (f < 1588) FX.questionMarks(ctx, hd.x, hd.y - hd.r * 1.6, Math.min(1, lf / 6), lt);
    const opts = [['PANCAKES?', '#ffd43b', '#1c1530', 200, 520, -0.08], ['SPAGHETTI?', '#ff4d4d', '#fff', 860, 600, 0.07], ['TOAST??', '#4fc3f7', '#1c1530', 220, 820, 0.05], ['CEREAL.', '#7ee081', '#1c1530', 860, 880, -0.06]];
    opts.forEach(([t, c, tc, x, y, r], i) => { const at = 1542 + i * 9; if (f >= at) FX.tag(ctx, x, y + Math.sin(lt * 2 + i) * 6, t, { col: c, tcol: tc, size: 66, rot: r, p: Math.min(1, (f - at) / 5) }); });
    if (f >= 1589) { FX.tag(ctx, 540, 210, 'WHAT SHOULD SAM COOK TOMORROW?', { col: '#ffffff', tcol: '#1c1530', size: 56, rot: -0.02, p: (f - 1589) / 6 }); FX.tag(ctx, 540, 1180, 'COMMENT BELOW 👇', { col: '#ff4d4d', tcol: '#fff', size: 88, rot: 0.03, p: (f - 1590) / 5 }); }
  } },
];
