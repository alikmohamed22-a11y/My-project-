// Ep3 "Day 3 of 30": the risotto. Select with ?story=d3. 30 fps.
// Voice: chefd3/audio/voice.wav (48.0 s, Jesse eleven_v4 take 1, atempo 1.08); words in words_d3.json.
// Shot: {a,b,cam,whip,smash,impact,flashes,draw(ctx,lf,f,lt,len)}.
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash, P, ell, line, circ, glow } from './util.js';
import { drawBg, drawFg } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import './phone_d3.js';
import * as FX from './fx.js';
import * as A from './d2_art.js';
import * as D from './d3_art.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1470;
export const CAPCONF = {
  file: 'words_d3.json',
  keyY: ['CHEF', 'PHOTO', 'RISOTTO', 'TONIGHT', 'NEVER', 'SPELL', '30', 'MINUTES', 'STOP', 'SPOON', 'DRILL', 'PIZZA', 'WINE', 'GRAPE', 'JUICE', 'BRO', 'DELIVERY', 'FANCY', 'LEAF', 'SENT', 'BEAUTIFUL', 'TOMORROW', 'TASTE', '27', 'TRUTH', 'COMMENT'],
  keyR: ['QUIT', 'EVERYWHERE', 'PURPLE', 'JAM'],
  quotes: [[97, 165], [879, 935], [1222, 1305]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep2) ---------------- */
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
const NIGHT = { col: '#7f9cff', amt: 0.22, dir: [1, -0.4] }, DAY = { col: '#ffd9a0', amt: 0.12, dir: [1, -0.5] };
const say = (t0, t1, text) => ({ text, t0, t1 });
const PH = { x: 150, y: 120, w: 780, h: 1180 };
const phoneIn = (lf, d = 9) => lerp(1900, PH.y, eBack(k01(lf, 0, d)));
const PU = '#7a2d96';
const KIT = (f, o = {}) => ({ t: sec(f), noPot: true, ...o });
// rice stuck all over the kitchen (walls / Sam) after the drill
const riceWalls = (ctx, k = 1) => D.riceStuck(ctx, 0, 120, W, 1500, 90, k, { seed: 21, size: 2.4 });
function spoonProp(ctx, x, y, s = 1, rot = 0, glob = PU) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); P(ctx, (c) => c.roundRect(-9, -260, 18, 260, 9), '#c88a52', 6); P(ctx, (c) => c.ellipse(0, -290, 34, 46, 0, 0, Math.PI * 2), '#c88a52', 6); P(ctx, (c) => c.ellipse(0, -300, 24, 26, 0, 0, Math.PI * 2), glob, 4); ctx.restore(); }
function couchSam(ctx, f, lt, atBuzz, { e0 = 'neutral', e1 = 'shock', sweat = 0 } = {}) {
  drawBg(ctx, 'apt_night', { t: sec(f) });
  const A_ = (t) => ({ x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, atBuzz + 2, e0, e1), look: [0.2, 0.7], light: NIGHT, rim: 'cool', sweat, rig: { squash: take(t, atBuzz + 1, 0.14), headNod: t < atBuzz + 2 ? 0.2 : -0.3 * io(t, atBuzz + 2, atBuzz + 7) } });
  const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
  FX.phoneGlow(ctx, hd.x + 40, hd.y + hd.r * 1.6, 380, '#8fd0ff', 0.4);
  drawFg(ctx, 'apt_night', { t: sec(f) });
  if (f >= atBuzz + 2) { FX.bang(ctx, hd.x + hd.r * 1.4, hd.y - hd.r * 1.2, 0.7, 0.2, '!', '#ffd43b', (f - atBuzz - 2) / 4); FX.impactLines(ctx, hd.x, hd.y, hd.r * 1.9, lt, { n: 10, col: '#ffd43b', lw: 8 }); }
  return hd;
}

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–37 "Day three." — title card; the head chef's text drops in on top (hook)
  { a: 0, b: 37, cam: { s: [1, 1.06], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 30, seed: 5 });
    FX.titleCard(ctx, lt, { big: 'DAY 3', p: 0.4 + lf / 10, out: lin(31, 37, lf) });
    FX.notifBanner(ctx, { app: 'MESSAGES', title: 'Head Chef 👨‍🍳', body: 'Send me a photo of your risotto.', icon: '💬', iconCol: '#3aa060', p: (f - 12) / 7, y: 110 });
  } },
  // ===== 37–97 "The head chef texted Sam," — couch at night, buzz (44), take
  { a: 37, b: 97, whip: 'r', cam: { s: [1.04, 1.14], f: [470, 820], drift: 3 }, draw(ctx, lf, f, lt) {
    couchSam(ctx, f, lt, 46, { e0: 'neutral', e1: 'shock' });
    FX.notifBanner(ctx, { app: 'MESSAGES', title: 'Head Chef 👨‍🍳', body: 'Send me a photo of your risotto.', icon: '💬', iconCol: '#3aa060', p: 1, out: lin(88, 96, f), y: 110 });
  } },
  // ===== 97–185 "Send me a photo of your risotto. Tonight!" — the thread; snap on "Tonight" (153)
  { a: 97, b: 185, whip: 'r', cam: { s: [1.0, 1.03], snap: [{ at: 57, to: 1.28, dur: 7, f: [420, 1060], over: 0.12 }], shake: [[57, 10, 7]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1d1a2e', col2: '#25213a', pattern: 'diag', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#e6b84a', 0.25);
    drawPhone(ctx, { ...PH, state: 'chef3', t: lt, n: lin(99, 105, f) + lin(153, 158, f), typing: f > 106 && f < 153, time: '6:12' });
    if (f >= 160) FX.bang(ctx, 760, 990, 0.8, 0.2, '!!', '#ff4d4d', (f - 160) / 4);
  } },
  // ===== 185–248 "Sam has never made risotto." — Sam holds up a bag of arborio like an alien artifact
  { a: 185, b: 248, whip: 'l', cam: { s: [1.0, 1.08], f: [540, 800], drift: 2, snap: [{ at: 15, to: 1.1, f: [560, 700], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const A_ = (t) => ({ x: 470, y: 1880, h: 1360, ...ptw(t, 187, 7, 'stand', 'holdUp'), ...ex(t, 200, 'neutral', 'confused'), look: [0.6, -0.6], light: DAY, rig: { squash: take(t, 200, 0.1), headTilt: 8 * io(t, 202, 214) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f), hd = headOf('SAM', o, f);
    D.riceBag(ctx, hn.x + 20, hn.y + 120, 0.95, 0.12 + 0.05 * Math.sin(lt * 3));
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 202) FX.questionMarks(ctx, hd.x, hd.y - hd.r * 1.7, Math.min(1, (f - 202) / 6), lt);
    if (f >= 200) FX.tag(ctx, 540, 230, 'TIMES MADE: 0', { col: '#ff4d4d', tcol: '#fff', size: 76, rot: -0.04, p: (f - 200) / 5 });
  } },
  // ===== 248–294 "He can't even spell it." — four failed searches → "Did you mean: risotto"
  { a: 248, b: 294, whip: 'r', cam: { s: [1, 1.03], snap: [{ at: 35, to: 1.22, dur: 7, f: [520, 900], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'dots', t: lt });
    drawPhone(ctx, { ...PH, state: 'spell', t: lt, k: lin(250, 282, f) * 4, res: lin(283, 289, f) });
    if (f >= 287) FX.bang(ctx, 900, 900, 0.6, 0.2, '!', '#ffd43b', (f - 287) / 3);
  } },
  // ===== 294–395 "The recipe said: stir for 30 minutes. Don't stop." — recipe card, highlight (343), red underline (383)
  { a: 294, b: 395, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 88, to: 1.3, dur: 7, f: [420, 940], over: 0.12 }], shake: [[89, 10, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'grid', t: lt });
    const py = phoneIn(lf);
    drawPhone(ctx, { ...PH, y: py, rot: (1 - k01(lf, 0, 9)) * -0.1, state: 'recipe', t: lt, h1: lin(330, 345, f), stop: lin(382, 388, f) });
    if (f >= 384) FX.tag(ctx, 830, 470, "DON'T STOP", { col: '#ff4d4d', tcol: '#fff', size: 64, rot: 0.08, p: (f - 384) / 4 });
  } },
  // ===== 395–475 "Sam's arm quit after two." — stirring like mad, the stopwatch hits 2:00 (449) and the arm drops
  { a: 395, b: 475, whip: 'r', cam: { s: [1.0, 1.08], f: [540, 1100], drift: 2, shake: [[56, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    const drop = eIn(k01(f, 449, 458)), ang = lt * lerp(9, 4, k01(f, 420, 449)) + (f > 449 ? 0 : 0);
    D.pot(ctx, 540, 1330, 1.9, { fill: 0.8, boil: 0.7, t: lt, spoon: drop > 0 ? 0.35 : null });
    FX.steam(ctx, 540, 960, lt, { amt: 0.8, w: 500, h: 500 });
    if (drop < 1) D.armStir(ctx, 560, 1040, f < 449 ? ang : 449 / FPS * 6, { from: [1300, 250], r: 90, drop, leaveSpoon: drop > 0 });
    drawFg(ctx, 'burner_cu', { t: sec(f), on: 1 });
    const secs = Math.min(120, Math.round(lin(395, 449, f) * 120)), txtT = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    D.timerBadge(ctx, 860, 360, txtT, 1, f >= 449 ? '#ff4d4d' : '#fff', f >= 449 ? '#fff' : INK);
    if (f < 449) FX.motionLines(ctx, 640, 900, -1, 0.4, { n: 4, len: 120, spread: 200, t: lt, col: '#fff' });
    if (f >= 451) FX.boom(ctx, 330, 560, 'FLOP.', (f - 451) / 5, { size: 110, col: '#fff', burst: '#4fc3f7', rot: -0.1, t: lt });
    if (f >= 458) FX.tag(ctx, 540, 250, 'ARM: OFFLINE', { col: '#ff4d4d', tcol: '#fff', size: 76, rot: -0.04, p: (f - 458) / 5 });
  } },
  // ===== 475–549 "So he taped the spoon to a power drill." — duct tape (488), revs it (528), smug
  { a: 475, b: 549, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 53, to: 1.12, f: [620, 700], dur: 6, over: 0.12 }], shake: [[54, 14, 5]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const A_ = (t) => ({ x: 430, y: 1880, h: 1360, ...ptw(t, 477, 7, 'stand', 'holdUp'), ...ex2(t, 488, 'determined', 'determined', 530, 'smug'), look: [0.7, -0.4], light: DAY, rig: { squash: take(t, 529, 0.1) + 0.02 * Math.sin(t * 2) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f);
    const rev = lin(527, 531, f), vib = rev > 0 ? (hash(f) - 0.5) * 8 : 0;
    D.drill(ctx, hn.x + 150 + vib, hn.y + 190, 0.85, -0.55, { tape: lin(487, 495, f), spin: f * 1.4 * rev, rev, t: lt });
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 488 && f < 506) FX.boom(ctx, 860, 600, 'RRRIP', (f - 488) / 5, { size: 90, col: '#fff', burst: null, rot: 0.1, t: lt });
    if (f >= 528) FX.boom(ctx, 760, 420, 'BZZZT!', (f - 528) / 5, { size: 110, col: '#ffd43b', burst: '#2b2735', rot: -0.08, t: lt });
    if (f >= 508) FX.tag(ctx, 300, 260, 'PRO HACK', { col: '#7ee081', tcol: INK, size: 72, rot: -0.06, p: (f - 508) / 5 });
  } },
  // ===== 549–585 "Rice went everywhere." — drill plunges in (552), rice explodes out, grains hit the lens
  { a: 549, b: 585, cam: { s: [1.0, 1.04], f: [540, 1050], shake: [[5, 30, 14]] }, impact: { at: 4, n: 1, type: 'flat', col: '#fff3c4' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    D.pot(ctx, 540, 1330, 1.9, { fill: lerp(0.8, 0.5, lin(553, 580, f)), boil: 1, t: lt });
    for (let b = 0; b < 4; b++) { const p = (f - 553 - b * 7) / 16; if (p > 0 && p < 1.2) D.riceSpray(ctx, 540, 1000, p, { n: 34, spread: 1100, seed: b * 13 + 1, size: 2.2 }); }
    const dy = lerp(-500, 0, eOut(k01(f, 549, 553))), shk = (hash(f) - 0.5) * 16;
    D.drill(ctx, 820 + shk, 520 + dy, 1.25, 1.05, { tape: 1, spin: f * 1.6, rev: 1, t: lt, rice: 1 });
    drawFg(ctx, 'burner_cu', { t: sec(f), on: 1 });
    if (f >= 553) FX.boom(ctx, 400, 360, 'BRRRRRT!', (f - 553) / 5, { size: 130, col: '#fff', burst: '#ff4d4d', rot: -0.06, t: lt });
    D.riceStuck(ctx, 0, 0, W, H, 70, lin(556, 582, f), { seed: 7, size: 3.6 });
  } },
  // ===== 585–603 aftermath (wide): rice on every surface, Sam frozen, drill winding down
  { a: 585, b: 603, cam: { s: [1.06, 1.1], f: [540, 860] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    riceWalls(ctx, 1);
    const A_ = (t) => ({ x: 470, y: 1880, h: 1360, pose: 'holdUp', expr: 'blank', look: [0, 0], light: DAY, rig: { squash: 0 } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f), hd = headOf('SAM', o, f);
    D.drill(ctx, hn.x + 150, hn.y + 190, 0.85, -0.55, { tape: 1, spin: f * lerp(1.2, 0.2, lf / 18), rev: 1 - lf / 18, t: lt, rice: 1 });
    D.riceStuck(ctx, hd.x - hd.r * 1.0, hd.y - hd.r * 1.3, hd.r * 2.0, hd.r * 0.6, 12, 1, { seed: 3, size: 2.4 }); D.riceStuck(ctx, hd.x - hd.r * 1.6, hd.y + hd.r * 1.4, hd.r * 3.2, hd.r * 2.5, 10, 1, { seed: 8, size: 2.4 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
  } },
  // ===== 603–640 "Even yesterday's pizza…" — rice pelts the ceiling fan; the old dough lets go (628)
  { a: 603, b: 640, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 860], shake: [[25, 10, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'fan_cu', { t: sec(f) });
    const ang = 0.6 + lt * 1.2, gone = f >= 628;
    A.ceilingFan(ctx, 540, 860, 470, ang, { t: lt, dough: gone ? 0 : 1, wobble: 1 });
    for (let b = 0; b < 3; b++) { const p = (f - 603 - b * 8) / 14; if (p > 0 && p < 1) D.riceSpray(ctx, 540, 2000, p, { n: 22, spread: 1500, seed: b * 7 + 3, size: 2.0, grav: 300 }); }
    if (gone) { const a = 0.6 + (628 / FPS - 603 / FPS) * 1.2, x0 = 540 + Math.cos(a) * 310, y0 = 890 + Math.sin(a) * 99, k = k01(f, 628, 640);
      A.dough(ctx, x0 + k * 40, y0 + eIn(k) * 1300, 200, { sq: 0.35, rot: 0.4 + k * 0.8, wob: 0.5 }); FX.motionLines(ctx, x0, y0 + eIn(k) * 1300 - 220, 0, -1, { n: 5, len: 200, spread: 300, t: lt, col: '#fff' }); }
    drawFg(ctx, 'fan_cu', { t: sec(f) });
    if (f >= 608) FX.tag(ctx, 540, 260, "YESTERDAY'S PIZZA", { col: '#ffd43b', tcol: INK, size: 70, rot: -0.04, p: (f - 608) / 5 });
    if (f >= 628) FX.boom(ctx, 820, 620, 'SHLUP', (f - 628) / 5, { size: 90, col: '#fff', burst: null, rot: 0.12, t: lt });
  } },
  // ===== 640–670 "…came down." — onto Sam's head (645)
  { a: 640, b: 670, cam: { s: [1.04, 1.1], f: [520, 760], shake: [[5, 12, 10]] }, impact: { at: 5, n: 2, type: 'ink' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    riceWalls(ctx, 1);
    const A_ = (t) => ({ x: 470, y: 1880, h: 1360, ...ptw(t, 646, 6, 'holdUp', 'stand'), ...ex(t, 646, 'blank', 'deadpan'), look: [0, -0.3], light: DAY, rig: { squash: take(t, 645, 0.2) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    D.riceStuck(ctx, hd.x - hd.r * 1.0, hd.y - hd.r * 1.3, hd.r * 2.0, hd.r * 0.6, 12, 1, { seed: 3, size: 2.4 }); D.riceStuck(ctx, hd.x - hd.r * 1.6, hd.y + hd.r * 1.4, hd.r * 3.2, hd.r * 2.5, 10, 1, { seed: 8, size: 2.4 });
    if (f < 645) { const y = lerp(-300, hd.y - hd.r * 0.9, eIn(k01(f, 640, 645))); A.dough(ctx, hd.x, y, 220, { sq: 0.4, rot: 0.3 }); }
    else { const sag = eOut(k01(f, 645, 655)); A.dough(ctx, hd.x, hd.y - hd.r * 0.75 + sag * 20, hd.r * 1.45, { sq: lerp(0.3, 0.55, sag), rot: 0.12, wob: 0.6 });
      for (let i = 0; i < 2; i++) { const dx = hd.x + (i ? 1 : -1) * hd.r * 1.15, L = 40 + 140 * sag * (i ? 0.7 : 1); P(ctx, (c) => { c.moveTo(dx - 16, hd.y - hd.r * 0.6); c.quadraticCurveTo(dx - 6, hd.y - hd.r * 0.6 + L * 0.7, dx, hd.y - hd.r * 0.6 + L); c.quadraticCurveTo(dx + 6, hd.y - hd.r * 0.6 + L * 0.7, dx + 16, hd.y - hd.r * 0.6); c.closePath(); }, '#f3d7a0', 5); } }
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 645) FX.boom(ctx, 760, 300, 'SPLAT!', (f - 645) / 6, { size: 140, col: '#fff', burst: '#ff4d4d', rot: -0.06, t: lt });
  } },
  // ===== 670–729 "Next: add white wine." — back to the recipe, step 2 highlights (695)
  { a: 670, b: 729, whip: 'l', cam: { s: [1.0, 1.04], snap: [{ at: 25, to: 1.28, dur: 7, f: [420, 1000], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'recipe', t: lt, h1: 1, stop: 1, h2: lin(694, 704, f) });
    if (f >= 703) FX.tag(ctx, 840, 1100, '🍷 ?', { col: '#fff', tcol: INK, size: 64, rot: 0.08, p: (f - 703) / 4 });
  } },
  // ===== 729–775 "Sam only had grape juice." — holds it up proudly: close enough
  { a: 729, b: 775, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 29, to: 1.1, f: [600, 700], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f + 30));
    riceWalls(ctx, 1);
    const A_ = (t) => ({ x: 470, y: 1880, h: 1360, ...ptw(t, 731, 6, 'stand', 'holdUp'), ...ex(t, 758, 'determined', 'proud'), look: [0.6, -0.6], light: DAY, rig: { squash: take(t, 758, 0.1), headTilt: 6 * io(t, 760, 770) } });
    const o = CH(ctx, 'SAM', A_, f); const hn = handOf('SAM', o, f);
    D.grapeJuice(ctx, hn.x + 20, hn.y + 140, 0.95, 0.1 + 0.04 * Math.sin(lt * 4));
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 759) { FX.tag(ctx, 540, 240, 'CLOSE ENOUGH.', { col: '#7ee081', tcol: INK, size: 80, rot: -0.04, p: (f - 759) / 5 }); FX.sparkle(ctx, hn.x + 150, hn.y - 120, 1.1, lt); }
  } },
  // ===== 775–836 "Now the risotto is purple." — glug glug, the pot turns purple; snap on "purple" (808)
  { a: 775, b: 836, cam: { s: [1.0, 1.06], f: [540, 1100], snap: [{ at: 33, to: 1.22, f: [540, 1120], dur: 6, over: 0.14 }], shake: [[33, 10, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    const pu = io(f, 782, 806);
    D.pot(ctx, 540, 1330, 1.9, { fill: 0.55, pu, boil: 0.8, t: lt });
    const tilt = lerp(0.2, 1.9, io(f, 775, 782)) - io(f, 800, 808) * 1.0, slide = (1 - eOut(k01(f, 775, 781))) * 600;
    const sp = [600 + slide, 640 - slide * 0.3];
    if (f >= 781 && f < 801) D.stream(ctx, sp[0] - 8, sp[1] + 10, 560 + Math.sin(lt * 9) * 6, 1010, lt, 34, PU);
    ctx.save(); ctx.translate(sp[0], sp[1]); ctx.rotate(-tilt); D.grapeJuice(ctx, 0, 340 * 0.95, 0.95, 0); ctx.restore();
    FX.steam(ctx, 540, 960, lt, { amt: 0.7, w: 500, h: 500, col: 'rgba(225,190,255,0.7)' });
    drawFg(ctx, 'burner_cu', { t: sec(f), on: 1 });
    if (f >= 785 && f < 800) FX.boom(ctx, 280, 640, 'GLUG GLUG', (f - 785) / 5, { size: 80, col: '#e9c8ff', burst: null, rot: -0.1, t: lt });
    if (f >= 808) FX.boom(ctx, 540, 330, 'PURPLE?!', (f - 808) / 5, { size: 140, col: '#fff', burst: '#8e3fa0', rot: -0.05, t: lt });
  } },
  // ===== 836–879 "His roommate tried it." — tastes a spoonful, Sam hopeful
  { a: 836, b: 879, whip: 'r', cam: { s: [1.02, 1.1], f: [540, 820], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f + 60));
    riceWalls(ctx, 1);
    CH(ctx, 'SAM', (t) => ({ x: 280, y: 1900, h: 1180, pose: 'stand', view: '34R', ...ex(t, 850, 'nervous', 'excited'), look: [0.6, -0.2], light: DAY, rig: { headTilt: 4 * Math.sin(t * 0.3), squash: take(t, 850, 0.08) } }), f);
    const R_ = (t) => ({ x: 740, y: 1880, h: 1400, ...ptw(t, 838, 7, 'stand', 'holdUp'), view: '34L', ...ex2(t, 840, 'neutral', 'neutral', 862, 'deadpan'), look: [-0.3, 0.1], light: DAY, rig: { headNod: 0.12 * Math.sin(t * 1.6) * k01(t, 852, 862) } });
    const o = CH(ctx, 'ROOMMATE', R_, f); const hn = handOf('ROOMMATE', o, f);
    spoonProp(ctx, hn.x, hn.y + 20, 0.8, -0.5 + 0.2 * io(f, 842, 850));
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 852 && f < 870) FX.boom(ctx, 900, 420, 'CHEW…', (f - 852) / 5, { size: 70, col: '#fff', burst: null, rot: 0.1, t: lt });
  } },
  // ===== 879–952 "Bro… that's jam." — deadpan close-up, speech bubble
  { a: 879, b: 952, cam: { s: [1.0, 1.1], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f + 60));
    riceWalls(ctx, 1);
    const A_ = (t) => place('ROOMMATE', 540, 980, 280, { ...ptw(t, 905, 6, 'stand', 'holdUp'), view: '34L', ...ex2(t, 879, 'deadpan', 'deadpan', 917, 'blank'), say: say(879, 931, 'Bro… that\'s jam.'), light: DAY, rig: { headTilt: -6 * io(t, 890, 900), headNod: 0.2 * io(t, 917, 924) } });
    const o = CH(ctx, 'ROOMMATE', A_, f); const hd = headOf('ROOMMATE', o, f), hn = handOf('ROOMMATE', o, f);
    if (f >= 905) spoonProp(ctx, hn.x, hn.y + 30, 1.1, -0.3);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.speechBubble(ctx, { x: 540, y: 330, text: 'Bro… that\'s jam.', tx: hd.x - 40, ty: hd.y - hd.r * 1.25, p: (lf - 1) / 6, size: 84, maxW: 900, hi: ['BRO', 'JAM'] });
    if (f >= 930) FX.tag(ctx, 820, 620, '🍇 JAM', { col: '#8e3fa0', tcol: '#fff', size: 64, rot: 0.08, p: (f - 930) / 5 });
  } },
  // ===== 952–1021 "So Sam did what real chefs do." — epic hero beat, then a smug look
  { a: 952, b: 1021, whip: 'l', cam: { s: [1.0, 1.1], f: [540, 860], snap: [{ at: 46, to: 1.14, dur: 6, f: [540, 760], over: 0.12 }] }, flashes: [[46, 3, 0.35]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,255,255,0.35)', r0: 520 });
    const A_ = (t) => place('SAM', 540, 820, 250, { ...ptw(t, 956, 7, 'stand', 'proudChest'), ...ex(t, 998, 'determined', 'smug'), rim: 'warm', rig: { squash: take(t, 970, 0.1), headTilt: 5 * io(t, 1000, 1010) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    D.riceStuck(ctx, hd.x - hd.r * 0.9, hd.y - hd.r * 1.25, hd.r * 1.8, hd.r * 0.5, 7, 1, { seed: 3, size: 2.2 });
    if (f >= 990) FX.tag(ctx, 540, 250, 'REAL CHEF MOVE™', { col: '#fff', tcol: INK, size: 80, rot: -0.04, p: (f - 990) / 5 });
    if (f >= 999) { FX.sparkle(ctx, 180, 600, 1, lt + 1); FX.sparkle(ctx, 900, 560, 1, lt + 2); }
  } },
  // ===== 1021–1066 "He ordered delivery." — delivery app, press (1031), order placed (1040)
  { a: 1021, b: 1066, whip: 'r', cam: { s: [1.0, 1.03], snap: [{ at: 19, to: 1.22, dur: 7, f: [540, 1100], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, state: 'forkd', t: lt, press: lin(1029, 1036, f), ok: lin(1038, 1044, f), time: '8:21' });
    if (f >= 1040) FX.boom(ctx, 830, 1340, 'DING!', (f - 1040) / 5, { size: 90, col: '#fff', burst: '#2fa75a', rot: 0.1, t: lt });
  } },
  // ===== 1066–1094 "Fancy plate," — the delivery risotto goes onto the fanciest plate in the apartment
  { a: 1066, b: 1094, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 1050], drift: 2 }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -230); drawBg(ctx, 'counter_cu', { t: sec(f) });
    D.deliveryBag(ctx, 210, 1250, 1.0, -0.04);
    const px = lerp(1500, 600, eOut(k01(f, 1066, 1074)));
    D.fancyPlate(ctx, px, 1290, 1.25, { risotto: eBack(k01(f, 1078, 1086)), leaf: 0, t: lt });
    const tilt = lerp(0, -2.0, io(f, 1072, 1080)) + io(f, 1086, 1092) * 1.6;
    if (f < 1093) D.takeoutTub(ctx, lerp(1300, 760, eOut(k01(f, 1068, 1075))), 1070 - io(f, 1072, 1080) * 60, 0.9, tilt);
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 1074) { FX.tag(ctx, 640, 330, 'FANCY PLATE ✨', { col: '#ffd43b', tcol: INK, size: 74, rot: -0.04, p: (f - 1074) / 5 }); FX.sparkle(ctx, px + 300, 1130, 1.1, lt); FX.sparkle(ctx, px - 320, 1180, 0.9, lt + 1); }
  } },
  // ===== 1094–1141 "one tiny leaf." — tweezers, total concentration, leaf lands (1118)
  { a: 1094, b: 1141, cam: { s: [1.18, 1.32], f: [600, 1240], drift: 1 }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -230); drawBg(ctx, 'counter_cu', { t: sec(f) });
    D.deliveryBag(ctx, 210, 1250, 1.0, -0.04);
    const lk = io(f, 1098, 1118), lx = 590, lyTop = 1290 - 52 * 1.25;
    D.fancyPlate(ctx, 600, 1290, 1.25, { risotto: 1, leaf: f >= 1118 ? 1 : 0, t: lt });
    if (f < 1130) { const tipY = lerp(lyTop - 420, lyTop - 4, lk) - (f >= 1118 ? eOut(k01(f, 1119, 1130)) * 500 : 0), open = f >= 1118 ? 1 : 0;
      if (f < 1118) { ctx.save(); ctx.translate(lx - 4, tipY + 10); ctx.rotate(-0.4); P(ctx, (c) => { c.moveTo(-20, 0); c.quadraticCurveTo(0, -18, 20, 0); c.quadraticCurveTo(0, 14, -20, 0); c.closePath(); }, '#3aa060', 3.5); ctx.restore(); }
      D.tweezers(ctx, lx, tipY, 1, -0.5, open); }
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 1118) { FX.sparkle(ctx, 640, 1150, 1.4, lt); FX.sparkle(ctx, 520, 1170, 0.9, lt + 1); FX.tag(ctx, 600, 420, '1 LEAF. PERFECT.', { col: '#7ee081', tcol: INK, size: 70, rot: -0.04, p: (f - 1118) / 5 }); }
    if (f >= 1100 && f < 1118) FX.sweatDrop(ctx, 840, 700, 1.4, lt, (f - 1100) * 4);
  } },
  // ===== 1141–1177 "Photo sent." — the phone frames ONLY the plate; the delivery bag sits right next to it. Shutter (1146)
  { a: 1141, b: 1177, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 1000] }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -230); drawBg(ctx, 'counter_cu', { t: sec(f) });
    D.deliveryBag(ctx, 840, 1250, 1.05, 0.04);
    D.takeoutTub(ctx, 1000, 1290, 0.7, 0.3);
    D.fancyPlate(ctx, 380, 1300, 1.0, { risotto: 1, leaf: 1, t: lt });
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    const ph = { x: 120, y: lerp(1500, 330, eOut(k01(f, 1141, 1148))), w: 520, h: 790 };
    D.hand(ctx, ph.x + 40, ph.y + 600, 1, 0.5); D.hand(ctx, ph.x + 480, ph.y + 620, 1, -0.4);
    drawPhone(ctx, { ...ph, state: 'camera', t: lt, lf, press: lin(1146, 1150, f), flash: f >= 1147 ? 1 - lin(1147, 1153, f) : 0, sent: lin(1155, 1161, f),
      content: (c, x, y, w, h) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#3d566b'); g.addColorStop(1, '#22303d'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,220,150,0.25)'; c.beginPath(); c.arc(w * 0.5, y + h * 0.3, 260, 0, 7); c.fill(); D.fancyPlate(c, w / 2, y + h * 0.6, 0.95, { risotto: 1, leaf: 1, t: lt }); } });
    if (f >= 1152) { FX.tag(ctx, 840, 820, 'NOT IN FRAME →', { col: '#ff4d4d', tcol: '#fff', size: 52, rot: 0.06, p: (f - 1152) / 5 }); }
    if (f >= 1147 && f < 1160) FX.boom(ctx, 760, 420, 'CLICK', (f - 1147) / 4, { size: 80, col: '#fff', burst: null, rot: 0.1, t: lt });
  } },
  // ===== 1177–1222 "The head chef replied," — couch, nervous, buzz (1188)
  { a: 1177, b: 1222, whip: 'l', cam: { s: [1.04, 1.14], f: [470, 820], drift: 3 }, draw(ctx, lf, f, lt) {
    const hd = couchSam(ctx, f, lt, 1188, { e0: 'nervous', e1: 'shock', sweat: 1 });
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.6, 1.2, lt, (lf % 13) * 6);
    FX.notifBanner(ctx, { app: 'MESSAGES', title: 'Head Chef 👨‍🍳', body: 'Beautiful.', icon: '💬', iconCol: '#3aa060', p: (f - 1190) / 7, y: 110 });
  } },
  // ===== 1222–1300 "Beautiful. Bring it tomorrow. I want to taste it." — replies pop in; snap on "taste" (1286)
  { a: 1222, b: 1300, whip: 'r', cam: { s: [1.0, 1.03], snap: [{ at: 64, to: 1.24, dur: 7, f: [460, 980], over: 0.12 }], shake: [[64, 10, 7]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1d1a2e', col2: '#25213a', pattern: 'diag', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#e6b84a', 0.25);
    const r1 = lin(1223, 1228, f), r2 = lin(1249, 1254, f), r3 = lin(1277, 1282, f);
    drawPhone(ctx, { ...PH, state: 'chef3', mode: 'reply', t: lt, r: r1 + r2 + r3, scroll: 220 + 120 * eOut(r2) + 200 * eOut(r3), typing: (f > 1230 && f < 1249) || (f > 1257 && f < 1277), time: '8:49' });
  } },
  // ===== 1300–1325 Sam's reaction: full panic (silence)
  { a: 1300, b: 1325, cam: { snap: [{ at: 1, to: 1.3, dur: 5, f: [540, 760], over: 0.15 }], shake: [[2, 14, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d63a3a', col2: '#c93333', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,240,230,0.4)', r0: 520 });
    const A_ = (t) => place('SAM', 540, 760, 300, { expr: 'panic', look: [0, 0], rim: 'warm', sweat: 1, rig: { squash: take(t, 1301, 0.16) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.6, 1.3, lt, (lf % 13) * 6); FX.sweatDrop(ctx, hd.x - hd.r * 1.1, hd.y - hd.r * 0.3, 1.0, lt, ((lf + 6) % 15) * 5);
    FX.boom(ctx, 540, 260, 'TASTE IT?!', lf / 5, { size: 130, col: '#fff', burst: '#1d1a2e', rot: -0.05, t: lt });
  } },
  // ===== 1325–1372 "Twenty-seven days left." — calendar, bonk (1333) → 27 DAYS LEFT card
  { a: 1325, b: 1372, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[8, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(1326, 1332, f), pill: lin(1330, 1334, f), time: '8:50', day: 3, pillText: '⏳ 27 days left' });
    if (f >= 1333) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1333, 1338, f)); FX.confetti(ctx, lt, { n: 30, seed: 11 }); FX.daysLeftCard(ctx, lt, (f - 1333) / 8, '27'); }
  } },
  // ===== 1372–1470 "Should Sam tell the truth? Comment below!"
  { a: 1372, b: LEN, whip: 'l', cam: { s: [1.0, 1.08], f: [540, 900], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f, { burner: 0.3 }));
    riceWalls(ctx, 1);
    D.pot(ctx, 760, 1060, 0.62, { fill: 0.5, pu: 1, boil: 0.3, t: lt, spoon: 0.3 });
    const A_ = (t) => ({ x: 440, y: 1900, h: 1250, ...(t < 1416 ? ptw(t, 1374, 6, 'stand', 'shrug') : ptw(t, 1416, 5, 'shrug', 'point')), view: 'front', ...ex(t, 1416, 'nervous', 'excited'), look: [t < 1416 ? 0.4 * Math.sin(t * 0.15) : 0, t < 1416 ? -0.6 : 0.6], rig: { headTilt: 6 * Math.sin(t * 0.12), squash: take(t, 1417, 0.14) } });
    const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.steam(ctx, 760, 940, lt, { amt: 0.5, w: 160, h: 240, col: 'rgba(225,190,255,0.7)' });
    if (f < 1416) FX.questionMarks(ctx, hd.x, hd.y - hd.r * 1.6, Math.min(1, lf / 6), lt);
    [['TELL THE TRUTH 😇', '#ffd43b', INK, 320, 370, -0.07, 1384], ['KEEP FAKING IT 😈', '#ff4d4d', '#fff', 760, 500, 0.06, 1394]].forEach(([t, c, tc, x, y, r, at], i) => { if (f >= at) FX.tag(ctx, x, y + Math.sin(lt * 2 + i) * 6, t, { col: c, tcol: tc, size: 60, rot: r, p: Math.min(1, (f - at) / 5) }); });
    if (f >= 1417) { FX.tag(ctx, 540, 210, 'WHAT SHOULD SAM DO? 👇', { col: '#ffffff', tcol: INK, size: 56, rot: -0.02, p: (f - 1417) / 6 }); FX.tag(ctx, 540, 1180, 'COMMENT BELOW 👇', { col: '#ff4d4d', tcol: '#fff', size: 88, rot: 0.03, p: (f - 1418) / 5 }); }
  } },
];
