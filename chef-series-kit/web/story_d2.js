// Ep2 "Day 2 of 30": the viewers' requests (cereal, sous vide chicken, pizza). Select with ?story=d2. 30 fps.
// Voice: chefd2/audio/voice.wav (40.7 s); word frames in work/words_frames.txt. Shot: {a,b,cam,whip,smash,impact,flashes,draw(ctx,lf,f,lt,len)}.
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash, P, ell, line, circ, glow } from './util.js';
import { drawBg, drawFg, KITCHEN } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import * as FX from './fx.js';
import * as A from './d2_art.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1250;
export const CAPCONF = {
  file: 'words_d2.json',
  keyY: ['DELIVERED', 'CEREAL', 'MILK', 'FIRST', 'STOVE', 'SOUS', 'VIDE', 'CHICKEN', 'ZIP', 'BAG', 'WARM', 'BATH', 'BRO', 'TUB', 'PIZZA', 'DOUGH', 'TV', 'CEILING', 'FAN', 'STILL', 'HEAD', 'CHEF', 'SAME', '28', 'COMMENT'],
  keyR: ['COOKED', 'BATHTUB', 'FLEW'],
  quotes: [[649, 712], [1000, 1045], [1080, 1100]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep1) ---------------- */
const k01 = (f, a, b) => clamp((f - a) / (b - a));
const io = (f, a, b) => eInOut(k01(f, a, b));
const ex = (f, at, from, to) => (f < at ? { expr: from } : { exprPrev: from, expr: to, exprT: f - at });
const ex2 = (f, at1, e0, e1, at2, e2) => (f < at2 ? ex(f, at1, e0, e1) : ex(f, at2, e1, e2));
const ptw = (f, at, dur, from, to) => ({ pose: from, pose2: to, mix: io(f, at, at + dur) });
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
function take(f, at, amt = 0.16) { const a = f - at; if (a < 0 || a > 12) return 0; return a < 3 ? -amt * (a / 3) : amt * 0.7 * Math.sin((a - 3) / 9 * Math.PI) * (1 - (a - 3) / 9); }
function blinkAt(f, seed) { const per = 96 + (seed % 5) * 9, ph = (f + seed * 37) % per; return ph < 2 ? 1 : ph < 4 ? 0.5 : 0; }
function CH(ctx, name, fn, f) {
  const o = fn(f), seed = o.seed ?? name.length * 7;
  drawChar(ctx, name, { view: 'front', pose: 'stand', expr: 'neutral', look: [0, 0], blink: blinkAt(f, seed), seed, shadow: true, ...o, t: f, track: (t) => fn(t) });
  return o;
}
function B(name, o, f) { try { return bounds(name, { view: 'front', pose: 'stand', ...o, t: f }); } catch (e) { return null; } }
function headOf(name, o, f = 0) { const b = B(name, o, f); if (b && b.head) return b.head; return { x: o.x, y: o.y - o.h * 0.83, r: o.h * 0.16 }; }
function handOf(name, o, f = 0) { const b = B(name, o, f); return b ? b.hand : { x: o.x, y: o.y - o.h * 0.5 }; }
function place(name, hx, hy, hr, o = {}) { const ref = headOf(name, { ...o, x: 0, y: 0, h: 1000 }); const h = hr / (ref.r / 1000); return { ...o, h, x: hx - ref.x * h / 1000, y: hy - ref.y * h / 1000 }; }
const NIGHT = { col: '#7f9cff', amt: 0.22, dir: [1, -0.4] }, DAY = { col: '#ffd9a0', amt: 0.12, dir: [1, -0.5] }, GOLD = { col: '#ffcf6b', amt: 0.25, dir: [0, -1] };
const say = (t0, t1, text) => ({ text, t0, t1 });
const tagTop = (ctx, text, p, o = {}) => FX.tag(ctx, o.x ?? 540, o.y ?? 230, text, { col: '#ffd43b', tcol: INK, size: 84, rot: -0.04, p, ...o });
const PH = { x: 150, y: 120, w: 780, h: 1180 };
const phoneIn = (lf, d = 9) => lerp(1900, PH.y, eBack(k01(lf, 0, d)));
function splashDrops(ctx, x, y, p, { n = 10, spread = 260, h = 260, col = '#bfe9ff', seed = 3 } = {}) {
  if (p <= 0 || p >= 1) return; for (let i = 0; i < n; i++) { const a = -Math.PI * (0.15 + 0.7 * hash(i + seed)), v = 0.6 + hash(i * 3.1 + seed) * 0.6, dx = Math.cos(a) * spread * v * p, dy = Math.sin(a) * h * v * p * 2 + h * 1.6 * p * p, r = (10 + hash(i * 1.3) * 12) * (1 - p * 0.5);
    P(ctx, (c) => c.ellipse(x + dx, y + dy, r, r * 1.3, a + Math.PI / 2, 0, Math.PI * 2), col, 4); }
}

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–32 "Day two." — title card
  { a: 0, b: 32, cam: { s: [1, 1.06], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 30, seed: 4 });
    FX.titleCard(ctx, lt, { big: 'DAY 2', p: 0.4 + lf / 10, out: lin(27, 32, lf) });
  } },
  // ===== 32–80 "Sam asked you what to cook," — lock screen fills with comment notifications (dings 40/52/63)
  { a: 32, b: 80, cam: { s: [1, 1.04], snap: [{ at: 33, to: 1.1, f: [540, 900], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    const py = phoneIn(lf); if (lf < 5) FX.motionLines(ctx, 540, py + 300, 0, -1, { n: 6, len: 300, spread: 600, t: lt, col: '#fff' });
    drawPhone(ctx, { ...PH, y: py, rot: (1 - k01(lf, 0, 9)) * 0.12, state: 'notifs', t: lt, n: lin(40, 45, f) + lin(52, 57, f) + lin(63, 68, f) + lin(70, 75, f) });
    [40, 52, 63].forEach((at, i) => { if (f >= at && f < at + 10) FX.impactLines(ctx, 900, 640 + i * 205, 60, lt, { n: 8, col: '#ffd43b', lw: 7, seed: i }); });
  } },
  // ===== 80–118 "…and you delivered." — Sam fired up: request tags fly in, hop on "delivered" (92)
  { a: 80, b: 118, whip: 'r', cam: { s: [1.04, 1.0], f: [540, 860], shake: [[13, 16, 8]] }, flashes: [[12, 3, 0.4]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,255,255,0.35)', r0: 520 });
    const A_ = (t) => ({ x: 540, y: 1900, h: 1300, ...ptw(t, 88, 6, 'stand', 'cheer'), ...ex(t, 88, 'determined', 'excited'), rim: 'warm', rig: hop(t, 89, { jump: 150, up: 14 }) });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    [['CEREAL', '#ffffff', INK, 210, 520, -0.12, 84], ['SOUS VIDE', '#4fc3f7', INK, 860, 430, 0.1, 86], ['PIZZA', '#ff4d4d', '#fff', 850, 1060, -0.08, 90]].forEach(([t, c, tc, x, y, r, at], i) => { if (f >= at) FX.tag(ctx, x, y + Math.sin(lt * 3 + i) * 8, t, { col: c, tcol: tc, size: 76, rot: r, p: (f - at) / 5 }); });
    if (f >= 94) { FX.bang(ctx, hd.x - hd.r * 1.5, hd.y - hd.r * 2.0, 0.8, -0.2, '!!', '#ffd43b', (f - 94) / 4); FX.impactLines(ctx, hd.x, hd.y, hd.r * 2.1, lt, { n: 12, col: '#fff', lw: 9 }); }
    if (f >= 106) FX.dustPuff(ctx, 540, 1880, (f - 106) / 10, { col: '#f6e7c4' });
  } },
  // ===== 118–161 "First: cereal." — Sam presents the cereal box like a trophy; snap on "cereal" (140)
  { a: 118, b: 161, cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 22, to: 1.12, f: [600, 700], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), noPot: true });
    const A_ = (t) => ({ x: 470, y: 1880, h: 1360, ...ptw(t, 121, 7, 'stand', 'holdUp'), ...ex(t, 138, 'determined', 'proud'), light: DAY, rig: { squash: take(t, 138, 0.1), headTilt: 5 * io(t, 140, 150) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f);
    A.cerealBox(ctx, hn.x + 10, hn.y + 30, 0.95, 0.1 + 0.04 * Math.sin(lt * 4));
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 140) { FX.sparkle(ctx, hn.x + 150, hn.y - 300, 1.2, lt); FX.sparkle(ctx, hn.x - 140, hn.y - 220, 0.9, lt + 1); }
    tagTop(ctx, 'REQUEST #1', lf / 5, { y: 230, size: 76 });
  } },
  // ===== 161–186 "Easy, right?" — smug close-up, finger point
  { a: 161, b: 186, cam: { s: [1.02, 1.1], f: [540, 800], bgBlur: 5 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), noPot: true });
    const A_ = (t) => place('SAM', 540, 760, 280, { ...ptw(t, 163, 6, 'stand', 'point'), view: '34L', ...ex(t, 164, 'proud', 'smug'), look: [-0.2, 0], light: DAY, rig: { headTilt: 7 * io(t, 166, 174), squash: take(t, 168, 0.08) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 170) FX.sparkle(ctx, hd.x - hd.r * 0.3, hd.y + hd.r * 0.5, 1.3 * Math.sin(k01(f, 170, 184) * Math.PI), lt);
    if (f >= 172) FX.tag(ctx, 540, 260, 'EASY.', { col: '#7ee081', tcol: INK, size: 80, rot: -0.05, p: (f - 172) / 5 });
  } },
  // ===== 186–235 "Sam poured the milk first," — milk into the EMPTY bowl (pour 194–226)
  { a: 186, b: 235, cam: { s: [1.0, 1.08], f: [540, 1000], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'counter_cu', { t: sec(f) });
    // carton pivots about its spout (sp); it slides in from the right first
    const tilt = lerp(0.35, 1.95, io(f, 190, 198)) - io(f, 226, 233) * 0.7, slide = (1 - eOut(k01(f, 186, 194))) * 600;
    const sp = [640 + slide, 690 - slide * 0.3], L = 500, base = [sp[0] + Math.sin(tilt) * L, sp[1] + Math.cos(tilt) * L];
    const lvl = lin(197, 228, f) * 0.72;
    A.bowl(ctx, 520, 1290, 1.75, { milk: lvl, t: lt });
    if (f >= 197 && f < 228) A.milkStream(ctx, sp[0] - 10, sp[1] + 10, 560 + Math.sin(lt * 9) * 5, lerp(1100, 1020, lvl / 0.72), lt, 34);
    A.milkCarton(ctx, base[0], base[1], 1.25, -tilt);
    if (f >= 200 && f < 228) splashDrops(ctx, 540, 1000, ((f - 200) % 9) / 9, { n: 5, spread: 140, h: 90, col: '#fbf8f0', seed: Math.floor((f - 200) / 9) });
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 212) FX.tag(ctx, 540, 300, 'MILK FIRST', { col: '#ff4d4d', tcol: '#fff', size: 84, rot: -0.05, p: (f - 212) / 5 });
  } },
  // ===== 235–268 "then the cereal." — cereal rains onto the milk (240–262)
  { a: 235, b: 268, cam: { s: [1.06, 1.12], f: [540, 1050] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'counter_cu', { t: sec(f) });
    const tilt = lerp(0.4, 2.35, io(f, 236, 243)), slide = (1 - eOut(k01(f, 235, 242))) * 700;
    const op = [420 - slide, 640 - slide * 0.2], L = 425, base = [op[0] - Math.sin(tilt) * L, op[1] + Math.cos(tilt) * L];
    const amt = lin(244, 262, f);
    A.bowl(ctx, 520, 1290, 1.75, { milk: 0.72, cereal: amt, t: lt, seed: 5 });
    if (f >= 243 && f < 262) A.cerealPour(ctx, op[0] + 10, op[1] + 20, 520, 1020, lt, 1, 4);
    A.cerealBox(ctx, base[0], base[1], 1.25, tilt);
    if (f >= 246 && f < 264) splashDrops(ctx, 520, 1020, ((f - 246) % 8) / 8, { n: 6, spread: 200, h: 100, col: '#fbf8f0', seed: Math.floor((f - 246) / 8) + 4 });
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 254) FX.tag(ctx, 800, 360, '(WRONG ORDER)', { col: '#fff', tcol: INK, size: 54, rot: 0.06, p: (f - 254) / 5 });
  } },
  // ===== 268–304 "Then he put it on the stove…" — bowl lands on the burner (276), knob, WHOOMP (296)
  { a: 268, b: 304, cam: { s: [1.0, 1.06], f: [540, 1100], shake: [[28, 14, 8]] }, flashes: [[28, 3, 0.35, '#ffb36b']], draw(ctx, lf, f, lt) {
    const on = lin(296, 300, f);
    drawBg(ctx, 'burner_cu', { t: sec(f), on, knob: io(f, 286, 294) });
    const by = lerp(200, 1330, eIn(k01(f, 268, 276))) - (f >= 276 && f < 282 ? Math.sin((f - 276) / 6 * Math.PI) * 30 : 0);
    A.bowl(ctx, 540, by, 1.9, { milk: 0.72, cereal: 1, t: lt, seed: 5 });
    if (f < 276) FX.motionLines(ctx, 540, by - 500, 0, -1, { n: 5, len: 200, spread: 500, t: lt, col: INK });
    drawFg(ctx, 'burner_cu', { t: sec(f), on });
    if (f >= 286 && f < 296) FX.tag(ctx, 330, 1560, 'HIGH HEAT', { col: '#ff4d4d', tcol: '#fff', size: 52, rot: -0.08, p: (f - 286) / 4 });
    if (f >= 296) FX.boom(ctx, 760, 520, 'FWOOMP!', (f - 296) / 6, { size: 120, col: '#fff', burst: '#ff8a3c', rot: 0.08, t: lt });
  } },
  // ===== 304–323 "…and cooked it." — stirring the bubbling cereal like a pro
  { a: 304, b: 323, cam: { s: [1.08, 1.16], f: [540, 1100], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    A.bowl(ctx, 540, 1330, 1.9, { milk: 0.72, cereal: 1, boil: 1, mush: lerp(0.3, 0.8, lin(304, 323, f)), t: lt, seed: 5 });
    FX.steam(ctx, 540, 1000, lt, { amt: 1, w: 500, h: 600 });
    A.armStir(ctx, 560, 1040, lt, { from: [1300, 250], r: 80, speed: 8 });
    drawFg(ctx, 'burner_cu', { t: sec(f), on: 1 });
    FX.boom(ctx, 300, 640, 'BLORP', ((f - 306) % 13) / 6, { size: 80, burst: null, col: '#f6e7c4', t: lt, seed: Math.floor((f - 306) / 13) });
  } },
  // ===== 323–339 snap-zoom reaction: Sam, deeply proud of his hot cereal
  { a: 323, b: 339, cam: { snap: [{ at: 1, to: 1.3, dur: 5, f: [540, 760], over: 0.15 }], shake: [[2, 12, 7]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#ff8a3c', col2: '#f27a2c', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,240,230,0.4)', r0: 520 });
    const A_ = (t) => place('SAM', 540, 760, 300, { expr: 'proud', look: [0, 0], rim: 'warm', rig: { squash: take(t, 324, 0.12), headTilt: -5 * io(t, 326, 334) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    FX.steam(ctx, 540, 1500, lt, { amt: 0.8, w: 700, h: 600 });
    for (let i = 0; i < 4; i++) FX.sparkle(ctx, 160 + i * 250, 420 + (i % 2) * 160, 1.1, lt + i);
    FX.tag(ctx, 540, 250, 'HOT CEREAL™', { col: '#fff', tcol: '#d6453d', size: 80, rot: -0.04, p: lf / 4 });
  } },
  // ===== 339–365 "Next:" — whip back to the lock screen, request #2 highlighted
  { a: 339, b: 365, whip: 'l', cam: { s: [1.0, 1.04], snap: [{ at: 9, to: 1.4, f: [540, 870], dur: 7, over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, state: 'notifs', t: lt, n: 4, hl: lf > 8 ? 1 : -1 });
    if (lf > 10) FX.tag(ctx, 540, 500, 'REQUEST #2', { col: '#ffd43b', tcol: INK, size: 64, rot: -0.05, p: (lf - 10) / 4 });
  } },
  // ===== 365–401 "sous vide chicken." — Sam hoists a raw chicken
  { a: 365, b: 401, cam: { s: [1.0, 1.08], f: [540, 760], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f) + 4, noPot: true });
    const A_ = (t) => ({ x: 470, y: 1880, h: 1360, ...ptw(t, 366, 6, 'stand', 'holdUp'), ...ex(t, 372, 'excited', 'determined'), look: [0.6, -0.7], light: DAY, rig: { squash: take(t, 370, 0.1), headTilt: 4 * Math.sin(t * 0.2) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f);
    A.rawChicken(ctx, hn.x + 30, hn.y - 60, 0.95, 0.15 + Math.sin(lt * 5) * 0.05);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 372) FX.tag(ctx, 540, 230, 'SOUS VIDE?', { col: '#4fc3f7', tcol: INK, size: 84, rot: -0.04, p: (f - 372) / 5 });
  } },
  // ===== 401–431 "Sam had no idea" — confused close-up, question marks
  { a: 401, b: 431, cam: { s: [1.04, 1.12], f: [540, 760], bgBlur: 5 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f) + 4, noPot: true });
    const A_ = (t) => place('SAM', 540, 780, 290, { ...ex(t, 404, 'determined', 'confused'), look: [0.3, -0.5], light: DAY, rig: { headTilt: 9 * io(t, 404, 414), squash: take(t, 404, 0.1) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.questionMarks(ctx, hd.x, hd.y - hd.r * 1.7, Math.min(1, lf / 6), lt);
    FX.thoughtBubble(ctx, { x: 790, y: 330, w: 420, h: 260, tx: hd.x + hd.r * 0.8, ty: hd.y - hd.r * 1.1, p: (lf - 6) / 8, t: lt, text: 'SUE THE WHAT?', size: 54 });
  } },
  // ===== 431–470 "what sous vide meant," — panicked search; "warm water bath" highlights (456)
  { a: 431, b: 470, whip: 'r', cam: { s: [1, 1.03], snap: [{ at: 25, to: 1.28, dur: 7, f: [480, 900], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'dots', t: lt });
    drawPhone(ctx, { ...PH, state: 'search', t: lt, typed: lin(432, 446, f), res: lin(447, 452, f), hl: lin(456, 464, f) });
    if (f >= 464) FX.bang(ctx, 900, 980, 0.6, 0.2, '!', '#ffd43b', (f - 464) / 3);
  } },
  // ===== 470–533 "so he put the chicken in his zip bag" — chicken drops in (486), ZZZIP (512–522)
  { a: 470, b: 533, cam: { s: [1.0, 1.06], f: [540, 860], shake: [[16, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    const cy = lerp(-300, 980, eIn(k01(f, 476, 486))) - (f >= 486 && f < 494 ? Math.sin((f - 486) / 8 * Math.PI) * 40 : 0);
    A.zipBag(ctx, 540, 880, 760, 900, 1 - io(f, 512, 522), { content: (c) => { if (f >= 486) A.rawChicken(c, 0, cy - 880, 1.6, 0.05); } });
    if (f < 486 && f >= 476) { A.rawChicken(ctx, 540, cy, 1.6, 0.05); FX.motionLines(ctx, 540, cy - 300, 0, -1, { n: 5, len: 200, spread: 300, t: lt, col: '#fff' }); }
    if (f >= 486 && f < 498) FX.boom(ctx, 830, 1360, 'FLOP', (f - 486) / 5, { size: 90, burst: null, col: '#fff', t: lt });
    if (f >= 512) FX.boom(ctx, 540, 330, 'ZZZIP!', (f - 512) / 7, { size: 120, col: '#fff', burst: '#2f8fd8', rot: -0.06, t: lt });
  } },
  // ===== 533–574 "and gave it a warm bath…" — bag splashes into the bubble bath (541)
  { a: 533, b: 574, whip: 'r', cam: { s: [1.22, 1.34], f: [560, 1210], drift: 2, shake: [[8, 10, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'bathroom', { t: sec(f) });
    const rim = A.BATH.rim, by = f < 541 ? lerp(300, rim - 10, eIn(k01(f, 533, 541))) : rim - 20 + Math.sin(lt * 2.2) * 6;
    A.BATH.tub(ctx, { t: lt, items: (c) => { A.rubberDuck(c, 250, rim + 4, 1.1, lt); A.zipBag(c, 640, by - 60, 300, 240, 0, { rot: 0.12 + Math.sin(lt * 1.7) * 0.05, content: (cc) => A.rawChicken(cc, 0, 30, 0.62) }); } });
    if (f >= 541) splashDrops(ctx, 640, rim - 20, (f - 541) / 14, { n: 12, spread: 320, h: 300 });
    A.bubbles(ctx, 540, rim - 40, lt, { n: 12, spread: 800, rise: 700 });
    drawFg(ctx, 'bathroom', { t: sec(f) });
    if (f >= 541 && f < 556) FX.boom(ctx, 600, 820, 'SPLOOSH', (f - 541) / 6, { size: 100, col: '#fff', burst: '#4fc3f7', t: lt });
    if (f >= 556) FX.tag(ctx, 560, 560, 'SPA DAY 🛁', { col: '#ff6fa8', tcol: '#fff', size: 70, rot: -0.05, p: (f - 556) / 5 });
  } },
  // ===== 574–607 "in his bathtub." — Sam checks the water with a meat thermometer, very serious
  { a: 574, b: 607, cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 8, to: 1.14, f: [540, 850], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'bathroom', { t: sec(f) });
    const A_ = (t) => ({ x: 560, y: 1680, h: 1300, ...ptw(t, 575, 6, 'stand', 'point'), view: '34R', ...ex(t, 584, 'determined', 'proud'), look: [0.3, 0.6], light: DAY, rig: { headNod: 0.25, squash: take(t, 584, 0.08) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f);
    const rim = A.BATH.rim;
    A.thermometer(ctx, hn.x + 10, hn.y - 30, 1.15, 0.15, f >= 584 ? '57°C' : '--');
    A.BATH.tub(ctx, { t: lt, items: (c) => { A.rubberDuck(c, 250, rim + 4, 1.1, lt); A.zipBag(c, 760, rim - 80 + Math.sin(lt * 2.2) * 6, 300, 240, 0, { rot: -0.1 + Math.sin(lt * 1.7) * 0.05, content: (cc) => A.rawChicken(cc, 0, 30, 0.62) }); } });
    drawFg(ctx, 'bathroom', { t: sec(f) });
    if (f >= 586) FX.tag(ctx, 540, 250, 'PERFECT.', { col: '#7ee081', tcol: INK, size: 80, rot: -0.04, p: (f - 586) / 5 });
  } },
  // ===== 607–649 "His roommate walks in." — through the bathroom door, toward camera
  { a: 607, b: 649, whip: 'r', cam: { s: [1.0, 1.08], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'bath_door', { t: sec(f) });
    const A_ = (t) => { const w = k01(t, 607, 634); return { x: 540 + Math.sin(t * 0.33) * 14 * (1 - w), y: lerp(1560, 1760, eInOut(w)), h: lerp(860, 1340, eInOut(w)), pose: t < 634 ? 'walk' : 'stand', view: 'front', ...ex(t, 636, 'neutral', 'confused'), look: [0.4 * io(t, 636, 642), 0.3], rig: { squash: take(t, 636, 0.1) } }; };
    CH(ctx, 'ROOMMATE', A_, f);
    drawFg(ctx, 'bath_door', { t: sec(f) });
    if (f >= 638) FX.bang(ctx, 860, 520, 0.7, 0.2, '?', '#fff', (f - 638) / 4);
  } },
  // ===== 649–718 "Bro… why is the chicken in the tub?" — deadpan, points at the tub on "tub" (698)
  { a: 649, b: 718, cam: { s: [1.0, 1.1], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'bath_door', { t: sec(f) });
    const A_ = (t) => place('ROOMMATE', 540, 980, 280, { ...ptw(t, 692, 6, 'stand', 'point'), view: '34R', ...ex2(t, 649, 'confused', 'deadpan', 694, 'blank'), say: say(649, 706, 'Bro… why is the chicken in the tub?'), rig: { headTilt: -6 * io(t, 664, 674), headNod: 0.2 * io(t, 694, 700) } });
    const o = CH(ctx, 'ROOMMATE', A_, f); const hd = headOf('ROOMMATE', o, f);
    drawFg(ctx, 'bath_door', { t: sec(f) });
    FX.speechBubble(ctx, { x: 540, y: 330, text: 'Bro… why is the chicken in the tub?', tx: hd.x + 40, ty: hd.y - hd.r * 1.25, p: (lf - 1) / 6, size: 70, maxW: 900, hi: ['BRO', 'CHICKEN', 'TUB'] });
  } },
  // ===== 718–747 "Then somebody said" — lock screen, request #3 highlighted
  { a: 718, b: 747, whip: 'l', cam: { s: [1.0, 1.04], snap: [{ at: 8, to: 1.4, f: [540, 1080], dur: 7, over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, state: 'notifs', t: lt, n: 4, hl: lf > 7 ? 2 : -1 });
    if (lf > 10) FX.tag(ctx, 540, 560, 'REQUEST #3', { col: '#ffd43b', tcol: INK, size: 64, rot: 0.05, p: (lf - 10) / 4 });
  } },
  // ===== 747–774 "pizza." — Sam, pizza mode: dough in hand, hop
  { a: 747, b: 774, cam: { s: [1.0, 1.04], snap: [{ at: 3, to: 1.1, dur: 6, f: [540, 780], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d63a3a', col2: '#c93333', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,240,230,0.35)', r0: 540 });
    const A_ = (t) => ({ x: 540, y: 1900, h: 1300, ...ptw(t, 748, 6, 'stand', 'holdUp'), ...ex(t, 750, 'determined', 'excited'), rim: 'warm', rig: hop(t, 749, { jump: 90, up: 12, sq: 0.16 }) });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f);
    A.dough(ctx, hn.x + 30, hn.y - 150, 170, { sq: 0.4, rot: 0.1 });
    FX.tag(ctx, 540, 230, 'PIZZA TIME', { col: '#ffd43b', tcol: INK, size: 84, rot: -0.04, p: lf / 5 });
    for (let i = 0; i < 4; i++) FX.sparkle(ctx, 140 + i * 260, 520 + (i % 2) * 140, 1, lt + i);
  } },
  // ===== 774–807 "Sam spun the dough" — living room, dough spinning overhead
  { a: 774, b: 807, whip: 'r', cam: { s: [1.02, 1.1], f: [540, 800], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const A_ = (t) => ({ x: 540, y: 1850, h: 1300, pose: 'cheer', ...ex(t, 780, 'determined', 'excited'), look: [0, -0.9], light: NIGHT, rim: 'cool', rig: { bodyLean: 3 * Math.sin(t * 0.7), squash: 0.03 * Math.sin(t * 0.9) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f), hd = headOf('SAM', o, f);
    const sp = lt * 14, dy = Math.min(hn.y, hd.y - hd.r * 1.6) - 70 - 30 * Math.abs(Math.sin(lt * 4)); hn.x = hd.x + 20;
    A.dough(ctx, hn.x - 20, dy, 190, { sq: 0.24, rot: Math.sin(sp) * 0.12, wob: 0.5 + 0.5 * Math.sin(sp * 0.5) });
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(hn.x - 20, dy, 250 + i * 26, 70 + i * 8, 0, sp + i, sp + i + 1.3); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.stroke(); }
    drawFg(ctx, 'apt_night', { t: sec(f) });
    if (f >= 784) FX.tag(ctx, 540, 240, 'LIKE A PRO', { col: '#ffd43b', tcol: INK, size: 80, rot: -0.05, p: (f - 784) / 5 });
  } },
  // ===== 807–832 "like the guys on TV," — the pizza show
  { a: 807, b: 832, cam: { s: [1.0, 1.06], f: [540, 760] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'tv_cu', { t: lt * 1.4 }); drawFg(ctx, 'tv_cu', { t: lt });
  } },
  // ===== 832–872 "and it flew straight" — launch: dough rockets off the top of frame (842), Sam's eyes follow
  { a: 832, b: 872, cam: { s: [1.06, 1.0], f: [540, 700], shake: [[10, 12, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const A_ = (t) => ({ x: 540, y: 1850, h: 1300, ...(t < 842 ? { pose: 'cheer' } : ptw(t, 842, 6, 'cheer', 'lookUp')), ...ex2(t, 842, 'excited', 'shock', 856, 'blank'), look: [0, -1], light: NIGHT, rim: 'cool', rig: { squash: take(t, 842, 0.14) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f); const hd = headOf('SAM', o, f);
    if (f < 842) { const sp = lt * 16; A.dough(ctx, hd.x, Math.min(hn.y, hd.y - hd.r * 1.6) - 70 - (f - 832) * 6, 190, { sq: 0.24, rot: Math.sin(sp) * 0.12, wob: 0.6 }); }
    else if (f < 852) { const y = lerp(hd.y - hd.r * 1.6 - 140, -400, eIn(k01(f, 842, 850))); A.dough(ctx, 520, y, 190, { sq: 0.3, rot: 0.3 }); FX.motionLines(ctx, 520, y + 200, 0, 1, { n: 6, len: 300, spread: 300, t: lt, col: '#fff' }); }
    drawFg(ctx, 'apt_night', { t: sec(f) });
    if (f >= 842) FX.boom(ctx, 760, 400, 'WHOOSH', (f - 842) / 6, { size: 100, col: '#fff', burst: null, rot: -0.15, t: lt });
    if (f >= 852) FX.bang(ctx, hd.x + hd.r * 1.4, hd.y - hd.r * 1.2, 0.7, 0.2, '!', '#ffd43b', (f - 852) / 4);
  } },
  // ===== 872–913 "into the ceiling fan." — SPLAT onto a blade (884), the fan keeps spinning
  { a: 872, b: 913, cam: { s: [1.0, 1.06], f: [540, 860], shake: [[12, 22, 10]] }, impact: { at: 12, n: 2, type: 'invert' }, flashes: [[14, 4, 0.4]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'fan_cu', { t: sec(f) });
    const ang = lt * 9, stuck = f >= 884;
    if (!stuck) { const y = lerp(2200, 900, eOut(k01(f, 872, 884))); A.dough(ctx, 540, y, 200, { sq: 0.35, rot: 0.4 }); FX.motionLines(ctx, 540, y + 260, 0, 1, { n: 6, len: 300, spread: 300, t: lt, col: '#fff' }); }
    A.ceilingFan(ctx, 540, 860, 470, ang, { t: lt, dough: stuck ? 1 : 0, wobble: stuck ? 1 : 0 });
    if (stuck) { ctx.save(); ctx.globalAlpha = 0.55; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(540, 890, 520 - i * 40, 170 - i * 14, 0, ang + i * 2, ang + i * 2 + 1.1); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.stroke(); } ctx.restore();
      FX.dustPuff(ctx, 640, 1000, (f - 884) / 10, { col: '#fbe8c2', spread: 420, size: 50, n: 5 }); }
    drawFg(ctx, 'fan_cu', { t: sec(f) });
    if (stuck) FX.boom(ctx, 540, 330, 'SPLAT!', (f - 884) / 6, { size: 150, col: '#fff', burst: '#ff4d4d', rot: -0.06, t: lt });
  } },
  // ===== 913–932 "It's still…" — Sam and the roommate staring up, blank
  { a: 913, b: 932, cam: { s: [1.06, 1.1], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    CH(ctx, 'ROOMMATE', (t) => ({ x: 790, y: 1800, h: 1340, pose: 'lookUp', view: '34L', expr: 'deadpan', light: NIGHT, rim: 'cool', rig: { headTilt: -4 } }), f);
    CH(ctx, 'SAM', (t) => ({ x: 330, y: 1830, h: 1240, pose: 'lookUp', view: '34R', expr: 'blank', light: NIGHT, rim: 'cool', soot: 0, rig: { headTilt: 5 } }), f);
    // flour dusting on Sam's hair
    drawFg(ctx, 'apt_night', { t: sec(f) });
    for (let i = 0; i < 14; i++) { const ph = (lt * 0.4 + hash(i)) % 1; circ(ctx, 120 + hash(i * 3.3) * 840, -40 + ph * 900, 5 + hash(i) * 4, 'rgba(255,248,230,0.9)', 0); }
  } },
  // ===== 932–950 "…up there." — back to the fan: slow turn, dough sagging, one strand dripping
  { a: 932, b: 950, cam: { s: [1.12, 1.18], f: [540, 860] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'fan_cu', { t: sec(f) });
    const ang = 0.6 + lt * 0.9;
    A.ceilingFan(ctx, 540, 860, 470, ang, { t: lt, dough: 1 });
    // strand drip from the dough's blade
    const a = ang, dx = 540 + Math.cos(a) * 470 * 0.66, dy = 890 + Math.sin(a) * 470 * 0.66 * 0.32 + 90, L = 120 + 200 * lin(932, 950, f);
    P(ctx, (c) => { c.moveTo(dx - 14, dy); c.quadraticCurveTo(dx - 6, dy + L * 0.6, dx, dy + L); c.quadraticCurveTo(dx + 6, dy + L * 0.6, dx + 14, dy); c.closePath(); }, '#f3d7a0', 5); circ(ctx, dx, dy + L + 6, 16, '#f3d7a0', 5);
    drawFg(ctx, 'fan_cu', { t: sec(f) });
  } },
  // ===== 950–1000 "Then the head chef texts him." — couch, buzz (958), take
  { a: 950, b: 1000, whip: 'r', cam: { s: [1.04, 1.14], f: [470, 820], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const A_ = (t) => ({ x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, 960, 'neutral', 'shock'), look: [0.2, 0.7], light: NIGHT, rim: 'cool', rig: { squash: take(t, 959, 0.14), headNod: t < 960 ? 0.2 : -0.3 * io(t, 960, 965) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    FX.phoneGlow(ctx, hd.x + 40, hd.y + hd.r * 1.6, 380, '#8fd0ff', 0.4);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    if (f >= 960) { FX.bang(ctx, hd.x + hd.r * 1.4, hd.y - hd.r * 1.2, 0.7, 0.2, '!', '#ffd43b', (f - 960) / 4); FX.impactLines(ctx, hd.x, hd.y, hd.r * 1.9, lt, { n: 10, col: '#ffd43b', lw: 8 }); }
    FX.notifBanner(ctx, { app: 'MESSAGES', title: 'Head Chef 👨‍🍳', body: "Can't wait to see what you…", icon: '💬', iconCol: '#3aa060', p: (f - 954) / 7, y: 110 });
  } },
  // ===== 1000–1054 "Can't wait to see what you can do!" — the thread; snap on the message (1022)
  { a: 1000, b: 1054, cam: { s: [1.0, 1.03], snap: [{ at: 22, to: 1.25, dur: 7, f: [460, 860], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1d1a2e', col2: '#25213a', pattern: 'diag', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#e6b84a', 0.25);
    drawPhone(ctx, { ...PH, state: 'chef', t: lt, n: lin(1001, 1006, f) });
  } },
  // ===== 1054–1080 "Sam replies:" — sweaty close-up, thumbs hovering
  { a: 1054, b: 1080, cam: { s: [1.06, 1.16], f: [540, 800], shake: [[0, 3, 26]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const A_ = (t) => place('SAM', 540, 720, 300, { pose: 'typing', prop: 'phone', phoneGlow: 1, ...ex(t, 1056, 'nervous', 'panic'), look: [0, 0.8], light: NIGHT, rim: 'cool', sweat: 1, rig: { headNod: 0.15 } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    FX.phoneGlow(ctx, hd.x, hd.y + hd.r * 2.4, 420, '#8fd0ff', 0.45);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.6, 1.3, lt, (lf % 13) * 6); FX.sweatDrop(ctx, hd.x - hd.r * 1.1, hd.y - hd.r * 0.3, 1.0, lt, ((lf + 6) % 15) * 5);
    FX.sweatDrop(ctx, hd.x + hd.r * 0.6, hd.y - hd.r * 1.15, 0.9, lt, ((lf + 3) % 11) * 5);
  } },
  // ===== 1080–1103 "Same." — types it (1080–1086), SEND (1088), read (1097), chef typing…
  { a: 1080, b: 1103, cam: { s: [1.0, 1.04], snap: [{ at: 8, to: 1.12, dur: 5, f: [600, 760], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1d1a2e', col2: '#25213a', pattern: 'diag', t: lt });
    const keys = ['S', 'A', 'M', 'E', '.'], ki = Math.floor((f - 1080) / 1.4);
    drawPhone(ctx, { ...PH, state: 'chef', t: lt, n: 1, kb: 1, compact: 1, scroll: 80, typed: lin(1080, 1087, f), key: f < 1087 ? keys[clamp(ki, 0, 4)] : null, sent: lin(1088, 1092, f), read: f >= 1097 });
    if (f >= 1088 && f < 1096) FX.motionLines(ctx, 900, 960, 0, 1, { n: 4, len: 120, spread: 160, t: lt, col: '#fff' });
  } },
  // ===== 1103–1145 "Twenty-eight days left." — calendar, bonk (1116) → 28 DAYS LEFT card
  { a: 1103, b: 1145, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[13, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(1104, 1112, f), pill: lin(1110, 1116, f), time: '8:00', day: 2, pillText: '⏳ 28 days left' });
    if (f >= 1116) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1116, 1121, f)); FX.confetti(ctx, lt, { n: 30, seed: 9 }); FX.daysLeftCard(ctx, lt, (f - 1116) / 8, '28'); }
  } },
  // ===== 1145–1250 "So what should Sam try next? Comment below!"
  { a: 1145, b: LEN, whip: 'l', cam: { s: [1.0, 1.08], f: [540, 900], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), noPot: true, burner: 0.3, ceilingEgg: true });
    A.bowl(ctx, 700, 1000, 0.62, { milk: 0.7, cereal: 1, mush: 0.8, boil: 0.3, t: lt });
    const A_ = (t) => ({ x: 520, y: 1900, h: 1250, ...(t < 1197 ? ptw(t, 1148, 6, 'stand', 'shrug') : ptw(t, 1197, 5, 'shrug', 'point')), view: 'front', ...ex(t, 1197, 'confused', 'excited'), look: [t < 1197 ? 0.4 * Math.sin(t * 0.15) : 0, t < 1197 ? -0.6 : 0.6], rig: { headTilt: 6 * Math.sin(t * 0.12), squash: take(t, 1198, 0.14) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.steam(ctx, 700, 880, lt, { amt: 0.6, w: 160, h: 260 });
    if (f < 1197) FX.questionMarks(ctx, hd.x, hd.y - hd.r * 1.6, Math.min(1, lf / 6), lt);
    const opts = [['SUSHI?', '#ffd43b', INK, 200, 520, -0.08], ['A SOUFFLÉ??', '#ff4d4d', '#fff', 840, 600, 0.07], ['TACOS?', '#4fc3f7', INK, 220, 820, 0.05], ['TOAST.', '#7ee081', INK, 860, 880, -0.06]];
    opts.forEach(([t, c, tc, x, y, r], i) => { const at = 1158 + i * 9; if (f >= at) FX.tag(ctx, x, y + Math.sin(lt * 2 + i) * 6, t, { col: c, tcol: tc, size: 66, rot: r, p: Math.min(1, (f - at) / 5) }); });
    if (f >= 1198) { FX.tag(ctx, 540, 210, 'WHAT SHOULD SAM COOK NEXT? 👇', { col: '#ffffff', tcol: INK, size: 54, rot: -0.02, p: (f - 1198) / 6 }); FX.tag(ctx, 540, 1180, 'COMMENT BELOW 👇', { col: '#ff4d4d', tcol: '#fff', size: 88, rot: 0.03, p: (f - 1199) / 5 }); }
  } },
];
