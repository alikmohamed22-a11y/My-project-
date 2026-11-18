// Ep5 "Day 5 of 30": a viewer's dare → in-person class → the "background check" → the easy sandwich. Select with ?story=d5. 30 fps.
// Voice: chefd5/audio/voice.wav (47.6 s, Jesse eleven_v4 take 1, atempo 1.08); words in words_d5.json.
// Shot: {a,b,cam,whip,smash,impact,flashes,draw(ctx,lf,f,lt,len)}. All usernames / app / school / brand names on screen are invented.
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash, P, circ } from './util.js';
import { drawBg, drawFg } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import './phone_d3.js';
import './phone_d4.js';
import './phone_d5.js';
import * as FX from './fx.js';
import './d2_art.js';
import * as D from './d3_art.js';
import * as E from './d4_art.js';
import * as S from './d5_art.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1470;
export const CAPCONF = {
  file: 'words_d5.json',
  keyY: ['DARED', 'OFFLINE', 'BACKGROUND', 'SANDWICH', 'EASY', 'DARE', 'TEACHER', 'DIPLOMA', 'IMPRESSIVE', 'LESSON', 'BREAD', 'CHEESE', 'INSIDE', 'MUSTARD', 'PRESSED', 'BELIEVED', '25', 'REPLY'],
  keyR: ['FROZE', 'PLATE', 'OUTSIDE', 'FIRED', 'BACK', 'EVERYTHING', 'SHOT', 'OUT', 'MOSTLY'],
  quotes: [[93, 230], [331, 380], [571, 600], [1246, 1370]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep4) ---------------- */
const k01 = (f, a, b) => clamp((f - a) / (b - a));
const io = (f, a, b) => eInOut(k01(f, a, b));
const ex = (f, at, from, to) => (f < at ? { expr: from } : { exprPrev: from, expr: to, exprT: f - at });
const ex2 = (f, at1, e0, e1, at2, e2) => (f < at2 ? ex(f, at1, e0, e1) : ex(f, at2, e1, e2));
const ptw = (f, at, dur, from, to) => ({ pose: from, pose2: to, mix: io(f, at, at + dur) });
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
const SCHOOL = (f, o = {}) => ({ t: sec(f), ...o });
const BANNER = (p, out = 0) => ({ app: 'LOOPR', title: `${S.COMMENT_USER} commented`, body: 'Do a cooking class OFFLINE with a backgr…', icon: '💬', iconCol: '#7a3cff', p, out, y: 110 });
const SLEEVE = '#fbfaf7';

// Sam on the couch at night with his phone
function couchSam(ctx, f, { e0 = 'neutral', e1 = 'shock', at = 9999, sweat = 0 } = {}) {
  drawBg(ctx, 'apt_night', { t: sec(f) });
  const A_ = (t) => ({ x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, at, e0, e1), look: [0.2, 0.7], light: NIGHT, rim: 'cool', sweat, rig: { squash: take(t, at, 0.14), headNod: t < at ? 0.2 : -0.25 * io(t, at, at + 6) } });
  const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
  FX.phoneGlow(ctx, hd.x + 40, hd.y + hd.r * 1.6, 380, '#8fd0ff', 0.4);
  drawFg(ctx, 'apt_night', { t: sec(f) });
  return hd;
}
// the teacher in the classroom; fn(t) → char opts
function teacherAt(ctx, f, fn) { return CH(ctx, 'TEACHER', fn, f); }
const commentBg = (ctx, lt) => { drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'diag', t: lt }); FX.phoneGlow(ctx, 540, 800, 760, '#b48aff', 0.25); };
// flying filling pieces from a squashed sandwich at (cx,cy): k 0..1+ time since burst (s)
function fillingsBurst(ctx, cx, cy, k) {
  const items = [['l', -1, -0.3, 1.1], ['t', 1, -0.5, 0.8], ['h', -1, -0.8, 0.9], ['c', 1, -0.15, 0.8], ['t', -1, -0.05, 0.7], ['l', 1, -0.7, 0.9], ['h', 1, 0.1, 0.7], ['c', -1, -0.55, 0.7]];
  items.forEach(([kind, dir, vy, s], i) => {
    const sp = 700 + 300 * hash(i + 2), x = cx + dir * sp * k * (0.8 + 0.4 * hash(i)), y = cy + vy * 700 * k + 700 * k * k, r = dir * (k * 9 + i);
    if (kind === 'l') S.lettuce(ctx, x, y, s * 0.9, r); else if (kind === 't') S.tomato(ctx, x, y, s, r); else if (kind === 'h') S.ham(ctx, x, y, s * 0.8, r); else S.cheese(ctx, x, y, s * 0.6, r, 0.3);
  });
}

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–36 "Day 5." — title card; the viewer's comment drops in at once (hook)
  { a: 0, b: 36, cam: { s: [1, 1.06], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f6f66', col2: '#237a70', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 30, seed: 7 });
    FX.titleCard(ctx, lt, { big: 'DAY 5', p: 0.4 + lf / 10, out: lin(30, 36, lf) });
    FX.notifBanner(ctx, BANNER((f - 3) / 7));
  } },
  // ===== 36–90 "One of you dared Sam." — couch at night, Sam reads it, gulps on "Sam" (66)
  { a: 36, b: 90, whip: 'r', cam: { s: [1.04, 1.16], f: [470, 820], drift: 3 }, draw(ctx, lf, f, lt) {
    const hd = couchSam(ctx, f, { e0: 'neutral', e1: 'shock', at: 64, sweat: f >= 64 ? 1 : 0 });
    FX.notifBanner(ctx, BANNER(1, lin(80, 88, f)));
    if (f >= 56) FX.tag(ctx, 760, 520, 'A DARE?! 😳', { col: '#ffd43b', tcol: INK, size: 80, rot: 0.07, p: (f - 56) / 5 });
    if (f >= 66) FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.6, 1.2, lt, (lf % 13) * 6);
  } },
  // ===== 90–176 "Do a cooking class offline, with a background check." — the comment card; OFFLINE (103), BACKGROUND CHECK (153, snap)
  { a: 90, b: 176, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 800], snap: [{ at: 63, to: 1.22, dur: 7, f: [420, 820], over: 0.1 }], shake: [[64, 8, 6]] }, draw(ctx, lf, f, lt) {
    commentBg(ctx, lt);
    S.commentCard(ctx, { screen: false, x: 540, y: 820, p: lf / 8, hl: [lin(103, 122, f), lin(153, 166, f)], t: lt });
    if (f >= 122) FX.tag(ctx, 800, 300, 'OFFLINE 😨', { col: '#fff', tcol: INK, size: 74, rot: 0.06, p: (f - 122) / 5 });
    if (f >= 158) FX.tag(ctx, 470, 470, 'BACKGROUND CHECK?! 🔍', { col: '#ff4d4d', tcol: '#fff', size: 62, rot: -0.04, p: (f - 158) / 5 });
  } },
  // ===== 176–244 "Cook a sandwich. It is easy." — zoom to the sandwich line; the ☕🥪 "I believe in you"; heart tap (230)
  { a: 176, b: 244, cam: { s: [1.16, 1.22], f: [540, 900] }, draw(ctx, lf, f, lt) {
    commentBg(ctx, lt);
    S.commentCard(ctx, { screen: false, x: 540, y: 820, hl: [1, 1, lin(184, 220, f), lin(224, 236, f)], heart: lin(230, 238, f), t: lt });
    if (f >= 214) FX.tag(ctx, 760, 420, '"EASY" 🥪', { col: '#ffd43b', tcol: INK, size: 80, rot: 0.06, p: (f - 214) / 5 });
    if (f >= 231) { FX.sparkle(ctx, 900, 560, 1.1, lt); FX.sparkle(ctx, 780, 1160, 0.9, lt + 1); }
  } },
  // ===== 244–287 "Sam took the dare." — SimmerU in-person page; background-check line glows; Book press (258) → Booked (266); DARE ACCEPTED stamp
  { a: 244, b: 287, whip: 'r', cam: { s: [1.0, 1.04], snap: [{ at: 22, to: 1.12, dur: 6, f: [540, 1000], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, y: phoneIn(lf, 8), rot: (1 - k01(lf, 0, 8)) * 0.08, state: 'class5', t: lt, hiBg: lin(248, 256, f), press: lin(256, 262, f), ok: lin(264, 270, f) });
    if (f >= 268) FX.stamp(ctx, 540, 640, 'DARE ACCEPTED', (f - 268) / 10, { col: '#e8412f', size: 90, rot: -0.1, t: lt, lines: ['DARE', 'ACCEPTED'] });
  } },
  // ===== 287–331 "Then the teacher said," — the class: the teacher (invented "Chef Bea") with her clipboard, Sam at his station
  { a: 287, b: 331, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f));
    CH(ctx, 'SAM_CHEF', (t) => ({ x: 250, y: 1960, h: 1040, pose: 'stand', ...ex(t, 300, 'neutral', 'nervous'), look: [0.6, -0.1], light: DAY, rig: { headTilt: -4 } }), f);
    const o = teacherAt(ctx, f, (t) => ({ x: 740, y: 1930, h: 1240, ...ptw(t, 289, 7, 'stand', 'hold'), expr: 'happy', look: [-0.4, 0], light: DAY, rig: { squash: take(t, 300, 0.08) } }));
    const hn = handOf('TEACHER', o, f); S.clipboard(ctx, hn.x - 30, hn.y - 60, 0.9, -0.15);
    drawFg(ctx, 'cook_school', SCHOOL(f));
    if (f >= 294) FX.tag(ctx, 760, 240, 'CHEF BEA 👩🏾‍🍳', { col: '#2b9c8f', tcol: '#fff', size: 66, rot: 0.05, p: (f - 294) / 5 });
    if (f >= 300) FX.tag(ctx, 300, 340, 'IN PERSON 📍', { col: '#fff', tcol: INK, size: 60, rot: -0.06, p: (f - 300) / 5 });
  } },
  // ===== 331–400 "'First... background check.'" — teacher close, magnifying glass up; snap on "background" (358)
  { a: 331, b: 400, cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 27, to: 1.12, dur: 6, f: [540, 820], over: 0.12 }], shake: [[28, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f, { noStation: true }));
    const o = teacherAt(ctx, f, (t) => ({ ...place('TEACHER', 500, 900, 230, { ...ptw(t, 333, 7, 'hold', 'holdUp'), ...ex(t, 356, 'happy', 'smug'), look: [0.1, 0.1], light: DAY, say: say(331, 378, 'First... background check.'), rig: { headTilt: 4 * io(t, 340, 352) } }) }));
    const hd = headOf('TEACHER', o, f), hn = handOf('TEACHER', o, f);
    S.magnifier(ctx, hn.x + 30, hn.y - 120, 1.15, -0.5 + 0.06 * Math.sin(lt * 3));
    FX.speechBubble(ctx, { x: 540, y: 290, text: f < 352 ? 'First…' : 'First… background check! 🔍', tx: hd.x, ty: hd.y - hd.r * 2.2, p: (lf - 1) / 6, size: 80, maxW: 900, hi: ['BACKGROUND', 'CHECK!'] });
  } },
  // ===== 400–436 "Sam froze." — icy panic, the résumé lie flashes in a thought bubble
  { a: 400, b: 436, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 3, to: 1.1, dur: 5, f: [540, 760], over: 0.12 }] }, impact: { at: 0, n: 2, type: 'red', col: '#4fc3f7' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b6fb0', col2: '#3567a6', pattern: 'burst', t: lt * 0.2, cy: 900 });
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 540, 1160, 200, { expr: 'panic', look: [0, 0], blink: 0, sweat: 1, rig: { squash: take(t, 402, 0.12) + Math.sin(t * 3.1) * 0.006 } }), f); const hd = headOf('SAM_CHEF', o, f);
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.4, 1.3, lt, 0);
    FX.thoughtBubble(ctx, { x: 540, y: 340, w: 700, h: 470, tx: hd.x + hd.r * 0.9, ty: hd.y - hd.r * 2.4, p: (lf - 2) / 8, t: lt, seed: 5, content: (c) => {
      c.rotate(-0.04); S.resumeSheet(c, 0.82, 1);
      if (f >= 414) FX.stamp(c, 30, 40, 'FAKE?!', (f - 414) / 10, { col: '#e8412f', size: 80, rot: -0.2, t: lt });
    } });
    S.frost(ctx, lin(400, 410, f) * 0.85, lt);
    if (f >= 404) FX.tag(ctx, 830, 780, 'FROZEN 🥶', { col: '#bfe9ff', tcol: INK, size: 80, rot: 0.08, p: (f - 404) / 5 });
  } },
  // ===== 436–513 "So he stepped in front of the school's diploma." — Sam side-steps until the MASTER CHEF diploma frames his head
  { a: 436, b: 513, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 800], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f));
    const k = io(f, 444, 478), walking = f >= 444 && f < 478;
    CH(ctx, 'SAM_CHEF', (t) => ({ x: lerp(930, 540, io(t, 444, 478)), y: 1940, h: 1180, pose: walking ? 'tiptoe' : 'stand', ...(t < 480 ? { expr: 'nervous' } : ex(t, 480, 'nervous', 'smug')), look: [t < 478 ? -0.6 : 0, 0], light: DAY, sweat: t < 480 ? 1 : 0, rig: { squash: take(t, 480, 0.1) } }), f);
    drawFg(ctx, 'cook_school', SCHOOL(f));
    if (walking) FX.motionLines(ctx, lerp(930, 540, k) + 260, 1100, 1, 0, { n: 4, len: 140, spread: 360, t: lt, col: '#fff' });
    if (f >= 488) { FX.tag(ctx, 540, 240, 'SNEAKY 😏', { col: '#ffd43b', tcol: INK, size: 92, rot: -0.05, p: (f - 488) / 5 }); FX.sparkle(ctx, 250, 420, 1, lt); FX.sparkle(ctx, 840, 700, 0.9, lt + 1); }
  } },
  // ===== 513–571 "The teacher checked his background." — she inspects the wall BEHIND him with the magnifier
  { a: 513, b: 571, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 800], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f));
    CH(ctx, 'SAM_CHEF', (t) => ({ x: 520, y: 1940, h: 1180, pose: 'proudChest', expr: 'smug', look: [0.3, 0], light: DAY, rig: { headTilt: 3 * Math.sin(t * 0.2) } }), f);
    teacherAt(ctx, f, (t) => ({ x: 960, y: 1960, h: 1300, pose: 'point', expr: 'confused', look: [-0.7, -0.6], light: DAY, rig: { headTilt: -6 } }));
    drawFg(ctx, 'cook_school', SCHOOL(f));
    const mx = lerp(240, 720, io(f, 518, 560)), my = 520 + 30 * Math.sin(lt * 2.4);
    S.magnifier(ctx, mx, my, 1.2, 0.5, (c) => { c.save(); c.translate(mx, my); c.scale(1.7, 1.7); c.translate(-mx, -my); S.DIPLOMA_DRAW && S.DIPLOMA_DRAW(c); c.restore(); });
    if (f >= 540) FX.questionMarks(ctx, 900, 330, Math.min(1, (f - 540) / 6), lt);
  } },
  // ===== 571–610 "'Impressive.'" — happy teacher; BACKGROUND: CHECKED ✓ stamp
  { a: 571, b: 610, cam: { s: [1.0, 1.05], f: [540, 860], snap: [{ at: 2, to: 1.1, dur: 5, f: [540, 800], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f, { noStation: true }));
    const o = teacherAt(ctx, f, (t) => ({ ...place('TEACHER', 540, 960, 240, { ...ptw(t, 572, 6, 'stand', 'cheer'), ...ex(t, 572, 'confused', 'excited'), look: [0, 0], light: DAY, say: say(571, 596, 'Impressive!'), rig: { squash: take(t, 573, 0.12) } }) }));
    const hd = headOf('TEACHER', o, f);
    FX.speechBubble(ctx, { x: 540, y: 300, text: 'Impressive!', tx: hd.x + 40, ty: hd.y - hd.r * 2.0, p: (lf - 1) / 5, size: 96, maxW: 900, hi: ['IMPRESSIVE!'] });
    if (f >= 584) FX.stamp(ctx, 540, 1180, 'BACKGROUND: CHECKED ✓', (f - 584) / 10, { col: '#2fa75a', size: 70, rot: -0.08, t: lt });
    FX.sparkle(ctx, 200, 700, 1, lt); FX.sparkle(ctx, 880, 820, 1.1, lt + 2);
  } },
  // ===== 610–692 "Lesson one: the easy sandwich." — whiteboard recipe writes in; EASY gets circled (647)
  { a: 610, b: 692, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 700], snap: [{ at: 37, to: 1.12, dur: 6, f: [540, 560], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f));
    S.whiteboard(ctx, 70, 300, 940, 680, { p: lin(612, 668, f), hi: lin(647, 660, f) });
    teacherAt(ctx, f, (t) => ({ x: 900, y: 2060, h: 1250, pose: 'point', expr: 'happy', look: [-0.6, -0.5], light: DAY }));
    drawFg(ctx, 'cook_school', SCHOOL(f));
    if (f >= 612) FX.tag(ctx, 270, 230, 'LESSON 1', { col: '#fff', tcol: INK, size: 80, rot: -0.05, p: (f - 612) / 5 });
  } },
  // ===== 692–758 "Step one: butter the bread." — Sam's station: bread, plate, butter, knife
  { a: 692, b: 758, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 1100], drift: 2 }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -60); drawBg(ctx, 'counter_cu', { t: sec(f) });
    S.plate(ctx, 600, 1300, 1.2, {}); S.bread(ctx, 330, 1180, 0.85, -0.1); S.bread(ctx, 540, 1170, 0.85, 0.06);
    S.butterStick(ctx, 870, 1310, 1, 0.2);
    const k = io(f, 725, 745); S.butterKnife(ctx, lerp(880, 800, k), lerp(1390, 1370, k), 1.0, -0.25 - 0.1 * k, 0);
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 696) FX.tag(ctx, 540, 420, 'STEP 1: BUTTER 🧈', { col: '#ffd43b', tcol: INK, size: 84, rot: -0.04, p: (f - 696) / 5 });
  } },
  // ===== 758–801 "Sam buttered the plate." — the knife smears the PLATE; the bread stays naked
  { a: 758, b: 801, cam: { s: [1.06, 1.12], f: [600, 1240], snap: [{ at: 20, to: 1.3, dur: 6, f: [600, 1260], over: 0.12 }], shake: [[21, 8, 6]] }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -60); drawBg(ctx, 'counter_cu', { t: sec(f) });
    const k = lin(760, 790, f); S.plate(ctx, 600, 1300, 1.2, { butter: k }); S.bread(ctx, 330, 1180, 0.85, -0.1); S.bread(ctx, 540, 1170, 0.85, 0.06);
    S.butterStick(ctx, 870, 1310, 1, 0.2);
    const kx = 420 + 330 * ((k * 5) % 1), ky = 1290 + Math.floor(k * 5) * 14; if (k < 1) { S.butterKnife(ctx, kx, ky - 30, 1.1, -0.15, 1); D.hand(ctx, kx - 170, ky + 20, 0.75, -1.3, SLEEVE); } else S.butterKnife(ctx, 880, 1440, 1.1, -0.3, 1);
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 778) FX.tag(ctx, 600, 820, 'THE PLATE?! 🍽️', { col: '#ff4d4d', tcol: '#fff', size: 92, rot: 0.05, p: (f - 778) / 5 });
  } },
  // ===== 801–880 "Step two: cheese goes inside." — the teacher's perfect demo sandwich, cheese INSIDE ✓
  { a: 801, b: 880, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 1100], drift: 2 }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -60); drawBg(ctx, 'counter_cu', { t: sec(f) });
    E.board(ctx, 540, 1330, 1.1, {}); S.sandwich(ctx, 540, 1330, 1.15, { mode: 'normal' });
    if (f >= 838) { const p = eBack(k01(f, 838, 846)); ctx.save(); ctx.translate(870, 1080); ctx.scale(p, p); FX.tag(ctx, 0, 0, 'INSIDE ✓', { col: '#2fa75a', tcol: '#fff', size: 76, rot: 0.08 }); ctx.restore();
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(810, 1140); ctx.quadraticCurveTo(760, 1190, 700, 1200); ctx.stroke(); ctx.restore(); }
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 803) FX.tag(ctx, 540, 420, 'STEP 2: CHEESE 🧀', { col: '#ffd43b', tcol: INK, size: 84, rot: -0.04, p: (f - 803) / 5 });
    if (f >= 820) FX.sparkle(ctx, 300, 1100, 1, lt);
  } },
  // ===== 880–939 "Sam's cheese went outside." — Sam's sandwich wears the cheese like a jacket
  { a: 880, b: 939, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 1150], snap: [{ at: 27, to: 1.2, dur: 6, f: [540, 1160], over: 0.12 }], shake: [[28, 8, 6]] }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -60); drawBg(ctx, 'counter_cu', { t: sec(f) });
    E.board(ctx, 540, 1330, 1.1, {}); S.sandwich(ctx, 540, 1340, 1.45, { mode: 'cheeseOut', rot: 0.02 * Math.sin(lt * 4) });
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 907) FX.tag(ctx, 540, 820, 'INSIDE OUT 🧀', { col: '#ff4d4d', tcol: '#fff', size: 96, rot: -0.05, p: (f - 907) / 5 });
    if (f >= 910) FX.bang(ctx, 880, 980, 0.7, 0.2, '?!', '#ffd43b', (f - 910) / 4);
  } },
  // ===== 939–995 "Step three: mustard." — Sam lifts the ZING! bottle… nozzle pointing at his own face
  { a: 939, b: 995, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 860], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f, { noStation: true }));
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 520, 760, 220, { ...ptw(t, 941, 7, 'stand', 'holdUp'), ...ex(t, 968, 'neutral', 'determined'), look: [0.4, 0.5], light: DAY, rig: { squash: take(t, 968, 0.08) } }), f);
    const hn = handOf('SAM_CHEF', o, f); S.mustard(ctx, hn.x + 10, hn.y + 10, 0.95, -1.75 + 0.05 * Math.sin(lt * 3));
    if (f >= 942) FX.tag(ctx, 540, 250, 'STEP 3: MUSTARD 🟡', { col: '#ffd43b', tcol: INK, size: 80, rot: -0.04, p: (f - 942) / 5 });
    if (f >= 975) FX.tag(ctx, 830, 1220, 'UH… SAM?', { col: '#fff', tcol: INK, size: 62, rot: 0.07, p: (f - 975) / 5 });
  } },
  // ===== 995–1054 "The mustard fired back." — squeeze (1008) → jet → SPLURT on his face (1014)
  { a: 995, b: 1054, cam: { s: [1.04, 1.06], f: [540, 800], snap: [{ at: 19, to: 1.16, dur: 5, f: [540, 760], over: 0.14 }], shake: [[19, 14, 10]] }, flashes: [[19, 2, 0.5]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f, { noStation: true }));
    const hit = f >= 1014;
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 520, 760, 220, { pose: 'holdUp', ...(t < 1014 ? { expr: 'determined' } : ex(t, 1014, 'shock', 'blank')), look: [0, 0], blink: hit ? 0 : undefined, light: DAY, rig: { squash: take(t, 1014, 0.16) } }), f);
    const hd = headOf('SAM_CHEF', o, f), hn = handOf('SAM_CHEF', o, f), sq = lin(1006, 1010, f) * (1 - lin(1030, 1040, f));
    S.mustard(ctx, hn.x + 10, hn.y + 10, 0.95, -1.75, sq);
    const nx = hn.x + 10 + Math.sin(-1.75) * 250 * 0.95, ny = hn.y + 10 - Math.cos(-1.75) * 250 * 0.95;
    if (f >= 1008 && f < 1030) S.mustardJet(ctx, nx, ny, hd.x, hd.y, lin(1008, 1014, f), lt, 34);
    if (hit) { const k = eBack(k01(f, 1014, 1019)); [[-0.35, -0.05, 0.42, 1], [0.4, 0.15, 0.36, 2], [0.05, 0.5, 0.3, 3], [-0.1, -0.6, 0.26, 4]].forEach(([dx, dy, r, sd]) => { S.splat(ctx, hd.x + dx * hd.r, hd.y + dy * hd.r, r * hd.r * k, sd, S.MUST, sd); S.drips(ctx, hd.x + dx * hd.r, hd.y + dy * hd.r + r * hd.r * 0.6, r * hd.r, lin(1020, 1050, f), sd); });
      FX.boom(ctx, 540, 260, 'SPLURT!', (f - 1014) / 5, { size: 150, col: '#ffd43b', burst: '#ff4d4d', rot: -0.06, t: lt }); }
  } },
  // ===== 1054–1095 "Then he pressed down." — both hands slam down on the sandwich
  { a: 1054, b: 1095, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 1100], shake: [[22, 10, 9]] }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -60); drawBg(ctx, 'counter_cu', { t: sec(f) });
    const sq = eIn(k01(f, 1066, 1076));
    E.board(ctx, 540, 1330, 1.1, {}); S.sandwich(ctx, 540, 1330, 1.15, { mode: 'normal', squash: sq, puff: sq });
    const top = 1330 - 1.15 * 196 * (1 - 0.45 * sq), hy = lerp(top - 300, top, eIn(k01(f, 1062, 1076)));
    D.hand(ctx, 400, hy - 60, 0.85, Math.PI + 0.15, SLEEVE); D.hand(ctx, 680, hy - 60, 0.85, Math.PI - 0.15, SLEEVE);
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (f >= 1066 && f < 1078) FX.motionLines(ctx, 540, hy - 260, 0, 1, { n: 5, len: 160, spread: 500, t: lt, col: '#fff' });
    if (f >= 1074) FX.boom(ctx, 540, 420, 'PRESS!', (f - 1074) / 4, { size: 130, col: '#fff', burst: '#ff7a45', rot: -0.05, t: lt });
  } },
  // ===== 1095–1124 "Everything shot out." — fillings fire out sideways across the room
  { a: 1095, b: 1124, cam: { s: [1.02, 1.08], f: [540, 1100], shake: [[2, 20, 12]] }, impact: { at: 1, n: 2, type: 'red', col: '#ff7a45' }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -60); drawBg(ctx, 'counter_cu', { t: sec(f) });
    E.board(ctx, 540, 1330, 1.1, {}); S.sandwich(ctx, 540, 1330, 1.15, { mode: 'bread', squash: 1 });
    D.hand(ctx, 400, 1330 - 120 - 60, 0.85, Math.PI + 0.15, SLEEVE); D.hand(ctx, 680, 1330 - 120 - 60, 0.85, Math.PI - 0.15, SLEEVE);
    fillingsBurst(ctx, 540, 1250, sec(f - 1097));
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    FX.boom(ctx, 540, 380, 'SPLOOSH!', lf / 4, { size: 140, col: '#7ee081', burst: '#1d1a2e', rot: 0.05, t: lt });
  } },
  // ===== 1124–1145 (out) — the teacher, deadpan, a tomato slice on her glasses and lettuce on her hair
  { a: 1124, b: 1145, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 860] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f, { noStation: true }));
    const o = teacherAt(ctx, f, (t) => ({ ...place('TEACHER', 540, 900, 250, { pose: 'stand', expr: 'deadpan', look: [0, 0], light: DAY, rig: { squash: take(t, 1126, 0.1) } }) }));
    const hd = headOf('TEACHER', o, f), k = eBack(k01(f, 1124, 1129));
    S.tomato(ctx, hd.x - hd.r * 0.42, hd.y + hd.r * 0.05, 0.62 * k * hd.r / 160); S.lettuce(ctx, hd.x + hd.r * 0.35, hd.y - hd.r * 1.15, 0.9 * k * hd.r / 160, 0.4);
    if (f >= 1130) FX.tag(ctx, 540, 1250, '…', { col: '#fff', tcol: INK, size: 90, rot: 0.04, p: (f - 1130) / 4 });
  } },
  // ===== 1145–1211 "Sam made... a bread sandwich." — hero shot under a spotlight; snap on "bread" (1175)
  { a: 1145, b: 1211, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 1000], snap: [{ at: 30, to: 1.14, dur: 6, f: [540, 1000], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt, cy: 1000 });
    FX.phoneGlow(ctx, 540, 1000, 600, '#fff6c4', 0.5);
    S.plate(ctx, 540, 1150, 1.5, {}); S.sandwich(ctx, 540, 1130, 1.6, { mode: 'bread' });
    if (f >= 1175) { FX.sparkle(ctx, 260, 900, 1.2, lt); FX.sparkle(ctx, 820, 860, 1.1, lt + 1); FX.sparkle(ctx, 760, 1180, 0.8, lt + 2);
      FX.tag(ctx, 540, 480, 'BREAD SANDWICH 🍞🍞', { col: '#fff', tcol: INK, size: 84, rot: -0.04, p: (f - 1175) / 5 }); }
    if (f >= 1188) FX.tag(ctx, 830, 650, '5 STARS?', { col: '#ff4d4d', tcol: '#fff', size: 60, rot: 0.08, p: (f - 1188) / 5 });
  } },
  // ===== 1211–1246 "His reply to you?" — the comment again: liked by creator; Sam types his reply
  { a: 1211, b: 1246, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 900] }, draw(ctx, lf, f, lt) {
    commentBg(ctx, lt);
    S.commentCard(ctx, { screen: false, x: 540, y: 820, p: lf / 7, hl: [0, 0, 1, 1], heart: 1, liked: true, reply: 'you believed in me ❤️ so I made you a 🥪', replyK: lin(1216, 1244, f), t: lt });
  } },
  // ===== 1246–1339 "'You believed in me. So I made you a sandwich.'" — mustard-faced Sam holds up the plate, warm
  { a: 1246, b: 1339, whip: 'r', cam: { s: [1.0, 1.07], f: [540, 860], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'cook_school', SCHOOL(f));
    const o = CH(ctx, 'SAM_CHEF', (t) => ({ x: 540, y: 1960, h: 1300, ...ptw(t, 1248, 7, 'stand', 'hold'), ...ex(t, 1250, 'blank', 'happy'), look: [0, 0], light: DAY, say: say(1246, 1324, 'You believed in me. So I made you a sandwich.'), rig: { headTilt: 5 * Math.sin(t * 0.15) } }), f);
    const hd = headOf('SAM_CHEF', o, f), hn = handOf('SAM_CHEF', o, f);
    [[-0.62, 0.5, 0.22, 1], [0.6, -0.55, 0.2, 2], [0.15, -0.95, 0.18, 3]].forEach(([dx, dy, r, sd]) => S.splat(ctx, hd.x + dx * hd.r, hd.y + dy * hd.r, r * hd.r, sd, S.MUST, sd));
    drawFg(ctx, 'cook_school', SCHOOL(f));
    S.plate(ctx, hn.x - 80, 1450, 0.85, {}); S.sandwich(ctx, hn.x - 80, 1440, 0.75, { mode: 'bread' });
    FX.speechBubble(ctx, { x: 540, y: 290, text: f < 1284 ? 'You believed in me.' : 'So I made you a sandwich.', tx: hd.x + 40, ty: hd.y - hd.r * 2.6, p: (lf - 1) / 6, size: 80, maxW: 900, hi: ['BELIEVED', 'SANDWICH.'] });
    for (let i = 0; i < 4; i++) { const ph = (lt * 0.5 + i / 4) % 1; if (lf > 10) FX.tag(ctx, [110, 230, 850, 970][i] + Math.sin(lt * 2 + i) * 20, 1300 - ph * 700, '❤️', { col: '#ff9ad5', tcol: '#fff', size: 40, rot: 0.1 * Math.sin(i), p: 1 - Math.max(0, ph - 0.8) * 5 }); }
  } },
  // ===== 1339–1384 "'It's mostly bread.'" — snap close: sheepish grin, the plate up front
  { a: 1339, b: 1384, cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 18, to: 1.08, dur: 6, f: [540, 900], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#ff9ad5', col2: '#f58bc9', pattern: 'dots', t: lt });
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 540, 760, 230, { expr: 'nervous', look: [0, 0], say: say(1339, 1368, "It's mostly bread."), rig: { headTilt: -6 } }), f);
    const hd = headOf('SAM_CHEF', o, f);
    [[-0.62, 0.5, 0.22, 1], [0.6, -0.55, 0.2, 2]].forEach(([dx, dy, r, sd]) => S.splat(ctx, hd.x + dx * hd.r, hd.y + dy * hd.r, r * hd.r, sd, S.MUST, sd));
    S.plate(ctx, 540, 1420, 1.25, {}); S.sandwich(ctx, 540, 1405, 1.15, { mode: 'bread' });
    if (f >= 1356) FX.tag(ctx, 540, 250, 'MOSTLY BREAD 🍞', { col: '#fff', tcol: INK, size: 90, rot: -0.04, p: (f - 1356) / 5 });
  } },
  // ===== 1384–1470 "Twenty-five days left." — calendar, card (1390)
  { a: 1384, b: LEN, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[6, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(1385, 1391, f), pill: lin(1389, 1393, f), time: '7:13', day: 5, pillText: '⏳ 25 days left' });
    if (f >= 1390) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1390, 1395, f)); FX.confetti(ctx, lt, { n: 30, seed: 13 }); FX.daysLeftCard(ctx, lt, (f - 1390) / 8, '25'); }
    if (f >= 1428) FX.tag(ctx, 540, 1250, 'WHAT SHOULD SAM COOK NEXT? 👇', { col: '#ffd43b', tcol: INK, size: 54, rot: -0.03, p: (f - 1428) / 6 });
  } },
];
