// Ep4 "Day 4 of 30": the comments → online cooking class → the teacher is the head chef. Select with ?story=d4. 30 fps.
// Voice: chefd4/audio/voice.wav (48.4 s, Jesse eleven_v4 take 2, atempo 1.08); words in words_d4.json.
// Shot: {a,b,cam,whip,smash,impact,flashes,draw(ctx,lf,f,lt,len)}. All usernames / app names on screen are invented.
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash, P, circ } from './util.js';
import { drawBg, drawFg } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import './phone_d3.js';
import './phone_d4.js';
import * as FX from './fx.js';
import './d2_art.js';
import * as D from './d3_art.js';
import * as E from './d4_art.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1480;
export const CAPCONF = {
  file: 'words_d4.json',
  keyY: ['COMMENTS', 'COOKING', 'CLASS', 'TRUTH', 'LIVE', 'ONLINE', 'BEGINNERS', 'CAMERA', 'TEACHER', 'HAT', 'EYEBROWS', 'CHEF', 'NOT', 'ONION', 'PERFECT', 'CUBES', 'MUTE', 'ASSISTANT', 'WRONG', 'NUMBER', '26', 'RECOGNIZE', 'COMMENT', 'LESSON'],
  keyR: ['SCARY', 'LATE', 'JUICE', 'CRIED', 'SOBBED', 'LOUDLY', 'SLAPPED', 'FORGOT'],
  quotes: [[83, 130], [147, 210], [1133, 1225], [1262, 1282]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep3) ---------------- */
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
const KIT = (f, o = {}) => ({ t: sec(f), noPot: true, ...o });
const BANNER = (title, body, p, out = 0) => ({ app: 'LOOPR', title, body, icon: '💬', iconCol: '#7a3cff', p, out, y: 110 });

// Sam on the couch at night with his phone
function couchSam(ctx, f, lt, { e0 = 'neutral', e1 = 'nervous', at = 9999, sweat = 0, shiver = 0 } = {}) {
  drawBg(ctx, 'apt_night', { t: sec(f) });
  const A_ = (t) => ({ x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, at, e0, e1), look: [0.2, 0.7], light: NIGHT, rim: 'cool', sweat, rig: { squash: take(t, at, 0.12) + (shiver ? Math.sin(t * 2.6) * 0.012 * shiver : 0), headNod: t < at ? 0.2 : -0.2 * io(t, at, at + 6) } });
  const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
  FX.phoneGlow(ctx, hd.x + 40, hd.y + hd.r * 1.6, 380, '#8fd0ff', 0.4);
  drawFg(ctx, 'apt_night', { t: sec(f) });
  return hd;
}
// full-frame "webcam" view of Sam in his kitchen (SAM_CHEF: apron + too-big toque)
function samCam(ctx, f, fn, { webcam = null } = {}) {
  drawBg(ctx, 'apt_kitchen', KIT(f));
  const o = CH(ctx, 'SAM_CHEF', fn, f);
  drawFg(ctx, 'apt_kitchen', { t: sec(f) });
  return o;
}
// the head chef's own webcam: dark posh office wall, gold frames, copper pans
function chefRoom(ctx, lt) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b2a3a'); g.addColorStop(1, '#3e3350'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  // wallpaper stripes
  ctx.fillStyle = 'rgba(255,255,255,0.035)'; for (let x = -300; x < W + 300; x += 90) ctx.fillRect(x, -300, 40, H + 600);
  // gold frame
  P(ctx, (c) => c.rect(70, 260, 280, 360), '#c9a24a', 9); P(ctx, (c) => c.rect(100, 290, 220, 300), '#6a3d5a', 6); circ(ctx, 210, 430, 70, '#e6b84a', 6);
  // shelf + copper pans
  P(ctx, (c) => c.rect(640, 520, 460, 28), '#5a4630', 7);
  [[700, 470, 52], [820, 460, 62], [950, 475, 48]].forEach(([x, y, r]) => { P(ctx, (c) => c.ellipse(x, y, r, r * 0.9, 0, 0, 7), '#c9824a', 7); P(ctx, (c) => c.ellipse(x - r * 0.3, y - r * 0.3, r * 0.25, r * 0.15, -0.5, 0, 7), '#f0b27a', 0); });
  FX.phoneGlow(ctx, 540, 900, 700, '#ffd9a0', 0.18);
}
function chefCam(ctx, f, fn) { const o = CH(ctx, 'HEADCHEF', fn, f); return o; }
const SAMCH = (t, o) => ({ x: 540, y: 2050, h: 1500, look: [0, 0], light: DAY, ...o });

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–34 "Day 4." — title card; the first comment notification drops in (hook)
  { a: 0, b: 34, cam: { s: [1, 1.06], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 30, seed: 6 });
    FX.titleCard(ctx, lt, { big: 'DAY 4', p: 0.4 + lf / 10, out: lin(28, 34, lf) });
    FX.notifBanner(ctx, BANNER('crayon_fan22 commented', 'take a cooking class please 🙏', (f - 6) / 7));
  } },
  // ===== 34–83 "Sam read your comments." — couch at night, second banner (40), Sam reacts (58)
  { a: 34, b: 83, whip: 'r', cam: { s: [1.04, 1.14], f: [470, 820], drift: 3 }, draw(ctx, lf, f, lt) {
    couchSam(ctx, f, lt, { e0: 'neutral', e1: 'nervous', at: 58 });
    FX.notifBanner(ctx, BANNER('crayon_fan22 commented', 'take a cooking class please 🙏', 1, lin(40, 46, f)));
    FX.notifBanner(ctx, BANNER('tulip.lover commented', "tell the truth before it's too late", (f - 42) / 7, lin(76, 83, f)));
  } },
  // ===== 83–147 "Take a cooking class, please." — Loopr comments; row 1 highlights (94)
  { a: 83, b: 147, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 18, to: 1.2, dur: 7, f: [520, 760], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a2350', col2: '#312a5e', pattern: 'diag', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#b48aff', 0.25);
    drawPhone(ctx, { ...PH, y: phoneIn(lf), state: 'loopr', t: lt, n: lin(85, 100, f) * 5, h1: lin(94, 104, f), time: '9:41' });
    if (f >= 110) FX.tag(ctx, 830, 560, '2.3K LIKES', { col: '#ff4d4d', tcol: '#fff', size: 54, rot: 0.07, p: (f - 110) / 5 });
  } },
  // ===== 147–220 "Tell the truth before it's too late." — row 2 highlights (158), snap on "too late" (188)
  { a: 147, b: 220, cam: { s: [1.2, 1.22], f: [520, 800], snap: [{ at: 41, to: 1.42, dur: 7, f: [520, 860], over: 0.1 }], shake: [[42, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a2350', col2: '#312a5e', pattern: 'diag', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#b48aff', 0.25);
    drawPhone(ctx, { ...PH, state: 'loopr', t: lt, n: 5, h1: 1, h2: lin(156, 168, f), time: '9:41' });
    if (f >= 190) FX.bang(ctx, 880, 860, 0.7, 0.2, '!!', '#ff4d4d', (f - 190) / 4);
  } },
  // ===== 220–276 "The truth sounded scary." — Sam imagines confessing: a furious head chef in a thought bubble
  { a: 220, b: 276, whip: 'l', cam: { s: [1.08, 1.2], f: [470, 760], drift: 2 }, draw(ctx, lf, f, lt) {
    const hd = couchSam(ctx, f, lt, { e0: 'nervous', e1: 'mortified', at: 242, sweat: 1, shiver: f >= 242 ? 1 : 0 });
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.6, 1.2, lt, (lf % 13) * 6);
    FX.thoughtBubble(ctx, { x: 640, y: 330, w: 620, h: 440, tx: hd.x + hd.r * 0.8, ty: hd.y - hd.r * 1.3, p: (lf - 2) / 9, t: lt, seed: 4, content: (c) => {
      const o = place('HEADCHEF', 0, -10, 74, { expr: 'stern', rig: { squash: f >= 242 ? Math.sin(lt * 30) * 0.02 : 0 } });
      drawChar(c, 'HEADCHEF', { view: 'front', ...o, blink: 0, seed: 4, t: f, say: say(236, 270, 'AAAAAAH') });
      if (f >= 242) FX.boom(c, 0, -150, 'YOU\'RE FIRED!', (f - 242) / 5, { size: 64, col: '#fff', burst: '#ff4d4d', rot: -0.05, t: lt });
    } });
    if (f >= 244) FX.tag(ctx, 540, 1180, 'NOPE.', { col: '#ff4d4d', tcol: '#fff', size: 96, rot: 0.05, p: (f - 244) / 5 });
  } },
  // ===== 276–336 "So… cooking class." — SimmerU class page; Join press (306), "You're in!" (316)
  { a: 276, b: 336, whip: 'r', cam: { s: [1.0, 1.03], snap: [{ at: 30, to: 1.2, dur: 7, f: [540, 1120], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, y: phoneIn(lf), rot: (1 - k01(lf, 0, 9)) * 0.08, state: 'simmer', t: lt, press: lin(302, 310, f), ok: lin(314, 320, f) });
    if (f >= 316) FX.boom(ctx, 850, 1380, 'ENROLLED!', (f - 316) / 5, { size: 80, col: '#fff', burst: '#2fa75a', rot: 0.1, t: lt });
  } },
  // ===== 336–388 "Live. Online." — Sam suits up (SAM_CHEF) and props the phone up; LIVE (336) / ONLINE (359) stickers
  { a: 336, b: 388, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 23, to: 1.08, f: [560, 700], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const A_ = (t) => ({ x: 470, y: 1880, h: 1360, ...ptw(t, 338, 7, 'stand', 'proudChest'), ...ex(t, 360, 'determined', 'proud'), look: [0.5, -0.2], light: DAY, rig: { squash: take(t, 360, 0.1), headTilt: 5 * io(t, 362, 372) } });
    CH(ctx, 'SAM_CHEF', A_, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 337) FX.tag(ctx, 270, 330, '🔴 LIVE', { col: '#ff4d4d', tcol: '#fff', size: 90, rot: -0.07, p: (f - 337) / 5 });
    if (f >= 360) FX.tag(ctx, 790, 470, 'ONLINE 📱', { col: '#4fc3f7', tcol: INK, size: 80, rot: 0.06, p: (f - 360) / 5 });
    if (f >= 360) FX.sparkle(ctx, 760, 760, 1.1, lt);
  } },
  // ===== 388–442 "Cooking for total beginners." — the call: students pop in, title highlights (412)
  { a: 388, b: 442, whip: 'r', cam: { s: [1.0, 1.03], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, y: phoneIn(lf), state: 'call', t: lt, host: 0, hostWait: true, stud: lin(392, 420, f) * 5, wave: true, hiTitle: lin(410, 420, f), samPose: 'cheer', samExpr: 'grin', time: '7:00' });
  } },
  // ===== 442–475 "Camera on." — Sam's webcam: big grin, waving
  { a: 442, b: 475, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 800] }, flashes: [[0, 4, 0.5]], draw(ctx, lf, f, lt) {
    samCam(ctx, f, (t) => SAMCH(t, { ...ptw(t, 443, 5, 'stand', 'cheer'), ...ex(t, 444, 'neutral', 'grin'), rig: { squash: take(t, 446, 0.1), headTilt: 6 * Math.sin(t * 0.4) } }));
    E.webcam(ctx, { name: 'Sam (You)', muted: true, t: lt });
    if (f >= 450) FX.tag(ctx, 300, 300, 'CAMERA: ON 📷', { col: '#7ee081', tcol: INK, size: 76, rot: -0.05, p: (f - 450) / 5 });
  } },
  // ===== 475–523 "Then the teacher joined." — host tile: waiting… then pops in (497) showing… just the top of a very tall hat
  { a: 475, b: 523, whip: 'r', cam: { s: [1.0, 1.03], snap: [{ at: 24, to: 1.3, dur: 7, f: [540, 560], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, state: 'call', t: lt, host: lin(497, 503, f), hostWait: f < 497, hostName: 'Host', hc: { r: 90, fy: 1.25, expr: 'stern' }, stud: 5, samPose: 'stand', samExpr: 'neutral', time: '7:01' });
    if (f >= 499) FX.boom(ctx, 830, 330, 'DING!', (f - 499) / 5, { size: 80, col: '#fff', burst: '#ff7a45', rot: 0.1, t: lt });
  } },
  // ===== 523–559 "Tall hat." — full-frame host cam: tilt down a VERY tall toque
  { a: 523, b: 559, whip: 'l', cam: { s: [1.0, 1.0], drift: 1 }, draw(ctx, lf, f, lt) {
    chefRoom(ctx, lt);
    const k = io(f, 523, 556), cy = lerp(1750, 1250, k);
    chefCam(ctx, f, (t) => ({ ...place('HEADCHEF', 540, cy, 330, { expr: 'stern' }), look: [0, 0] }));
    E.webcam(ctx, { name: 'Host', muted: false, t: lt });
    if (f >= 526) FX.tag(ctx, 330, 300, 'TALL HAT 🎩', { col: '#fff', tcol: INK, size: 80, rot: -0.05, p: (f - 526) / 5 });
  } },
  // ===== 559–588 "Angry eyebrows." — snap close on the brows
  { a: 559, b: 588, cam: { s: [1.0, 1.04], snap: [{ at: 1, to: 1.12, dur: 5, f: [540, 760], over: 0.12 }], shake: [[2, 8, 6]] }, draw(ctx, lf, f, lt) {
    chefRoom(ctx, lt);
    chefCam(ctx, f, (t) => ({ ...place('HEADCHEF', 540, 900, 420, { expr: 'stern' }), rig: { squash: take(t, 560, 0.08) } }));
    E.webcam(ctx, { name: 'Host', muted: false, t: lt });
    if (f >= 562) FX.tag(ctx, 780, 330, 'ANGRY 😠', { col: '#ff4d4d', tcol: '#fff', size: 80, rot: 0.06, p: (f - 562) / 5 });
  } },
  // ===== 588–613 "It was the head chef!" — pull out: it's him, with his name tag
  { a: 588, b: 613, cam: { s: [1.18, 1.0], f: [540, 800] }, draw(ctx, lf, f, lt) {
    chefRoom(ctx, lt);
    chefCam(ctx, f, (t) => ({ ...place('HEADCHEF', 540, 860, 250, { ...ptw(t, 590, 8, 'stand', 'armsCrossed'), expr: 'stern' }) }));
    E.webcam(ctx, { name: 'Head Chef · Lumière', muted: false, t: lt });
    if (f >= 600) FX.stamp(ctx, 540, 360, 'HEAD CHEF', (f - 600) / 10, { col: '#ff4d4d', size: 110, rot: -0.1, t: lt });
  } },
  // ===== 613–640 Sam: total panic
  { a: 613, b: 640, cam: { snap: [{ at: 1, to: 1.3, dur: 5, f: [540, 760], over: 0.15 }], shake: [[2, 14, 9]] }, impact: { at: 0, n: 2, type: 'red', col: '#ff4d4d' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d63a3a', col2: '#c93333', pattern: 'burst', t: lt, cy: 760 });
    FX.actionLines(ctx, 540, 760, lt, { col: 'rgba(255,240,230,0.4)', r0: 520 });
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 540, 800, 280, { expr: 'panic', look: [0, 0], rim: 'warm', sweat: 1, rig: { squash: take(t, 614, 0.16) } }), f); const hd = headOf('SAM_CHEF', o, f);
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.4, 1.3, lt, (lf % 13) * 6);
    FX.boom(ctx, 540, 250, 'HIM?!', lf / 5, { size: 150, col: '#fff', burst: '#1d1a2e', rot: -0.05, t: lt });
  } },
  // ===== 640–690 "Sam slapped his camera off" — his hand lunges at the lens (650), screen goes black (653)
  { a: 640, b: 690, cam: { s: [1.0, 1.04], f: [540, 900], shake: [[12, 10, 12]] }, draw(ctx, lf, f, lt) {
    samCam(ctx, f, (t) => SAMCH(t, { ...ex(t, 640, 'panic', 'panic'), sweat: 1, look: [0, 0], rig: { squash: take(t, 650, 0.12) } }));
    const k = eIn(k01(f, 641, 651)); if (f < 653) E.webcam(ctx, { name: 'Sam (You)', muted: true, t: lt });
    if (f < 653) { const s = lerp(1.0, 4.2, k); D.hand(ctx, lerp(900, 560, k), lerp(1900, 1000, k), s, lerp(-0.5, -0.1, k), '#f2b52b'); }
    if (f >= 650 && f < 652) FX.tint(ctx, '#fff', 0.8);
    if (f >= 653) { E.webcam(ctx, { name: 'Sam (You)', muted: true, t: lt, camOff: 1 }); FX.boom(ctx, 540, 360, 'SLAP!', (f - 653) / 5, { size: 140, col: '#fff', burst: '#ff4d4d', rot: -0.06, t: lt }); }
  } },
  // ===== 690–748 "…and renamed himself 'Not Sam.'" — rename modal: type "Not Sam" (707–724), Save (730); tile updates
  { a: 690, b: 748, whip: 'r', cam: { s: [1.0, 1.03], snap: [{ at: 15, to: 1.22, dur: 7, f: [540, 700], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1d1a2e', col2: '#25213a', pattern: 'diag', t: lt });
    const typed = 'Not Sam'.slice(0, Math.round(lin(705, 722, f) * 7)), saved = f >= 732;
    drawPhone(ctx, { ...PH, state: 'call', t: lt, host: 1, hostName: 'Head Chef · Lumière', hc: { r: 70, fy: 0.42, expr: 'stern', pose: 'armsCrossed' }, stud: 5, samOff: true, samName: saved ? 'Not Sam' : 'Sam (You)', rename: saved ? 1 - lin(732, 737, f) : lin(692, 698, f), typed: typed || '', save: lin(728, 732, f), time: '7:02' });
    if (f >= 736) FX.tag(ctx, 540, 1440 - 160, 'MASTER OF DISGUISE 🥸', { col: '#ffd43b', tcol: INK, size: 64, rot: -0.04, p: (f - 736) / 5 });
  } },
  // ===== 748–815 "Lesson one: dice an onion." — the head chef holds up an onion
  { a: 748, b: 815, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 28, to: 1.12, f: [700, 700], dur: 6, over: 0.12 }] }, draw(ctx, lf, f, lt) {
    chefRoom(ctx, lt);
    const o = chefCam(ctx, f, (t) => ({ ...place('HEADCHEF', 470, 820, 230, { ...ptw(t, 750, 8, 'stand', 'holdUp'), ...ex(t, 776, 'stern', 'stern'), look: [0.3, -0.3] }) }));
    const hn = handOf('HEADCHEF', o, f); E.onion(ctx, hn.x + 10, hn.y - 60, 1.15, 0.15 + 0.04 * Math.sin(lt * 3));
    E.webcam(ctx, { name: 'Head Chef · Lumière', muted: false, t: lt });
    if (f >= 750) FX.tag(ctx, 300, 260, 'LESSON 1', { col: '#fff', tcol: INK, size: 86, rot: -0.05, p: (f - 750) / 5 });
    if (f >= 777) FX.tag(ctx, 640, 1210, 'DICE AN ONION 🧅', { col: '#ffd43b', tcol: INK, size: 70, rot: 0.04, p: (f - 777) / 5 });
  } },
  // ===== 815–879 "Everyone made perfect little cubes." — all the tiles: neat cube pyramids; sparkle on "cubes" (854)
  { a: 815, b: 879, whip: 'r', cam: { s: [1.0, 1.0], f: [540, 1000], snap: [{ at: 39, to: 1.38, dur: 7, f: [540, 1100], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: '#2f8790', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, state: 'call', t: lt, host: 1, hostName: 'Head Chef · Lumière', hc: { r: 70, fy: 0.42, expr: 'stern', pose: 'armsCrossed' }, stud: 5, cubes: lin(818, 850, f), samOff: true, samName: 'Not Sam', time: '7:09' });
    if (f >= 854) { FX.sparkle(ctx, 300, 1000, 1.2, lt); FX.sparkle(ctx, 780, 1080, 1, lt + 1); FX.tag(ctx, 540, 240, 'PERFECT ✨', { col: '#7ee081', tcol: INK, size: 80, rot: -0.04, p: (f - 854) / 5 }); }
  } },
  // ===== 879–935 "Sam made onion juice." — his board: a puddle, dripping off the edge
  { a: 879, b: 935, whip: 'l', cam: { s: [1.0, 1.08], f: [540, 1100], drift: 2 }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -120); drawBg(ctx, 'counter_cu', { t: sec(f) });
    const ch = Math.floor(f / 3) % 2, hits = f < 905;
    E.board(ctx, 560, 1300, 1.35, { juice: lerp(0.4, 1, io(f, 880, 905)), drip: lin(895, 930, f) * 1.6, t: lt });
    if (hits) { const up = ch ? 0 : 120; E.knife(ctx, 280, 1170 - up, 1.3, ch ? 0.12 : -0.15); D.hand(ctx, 160, 1230 - up, 0.8, -1.2); FX.motionLines(ctx, 540, 1100 - up, 0, -1, { n: 4, len: 120, spread: 300, t: lt, col: '#fff' }); }
    else E.knife(ctx, 120, 1380, 1.2, 0.05);
    drawFg(ctx, 'counter_cu', { t: sec(f) });
    if (hits) FX.boom(ctx, 800, 600, 'CHOP CHOP CHOP', (f - 880) / 4, { size: 74, col: '#fff', burst: null, rot: 0.08, t: lt });
    if (f >= 907) FX.tag(ctx, 540, 520, 'ONION JUICE 🧃', { col: '#ff4d4d', tcol: '#fff', size: 92, rot: -0.05, p: (f - 907) / 5 });
  } },
  // ===== 935–1018 "Then he cried. Then he sobbed." — close-up: drip tears (947), garden-hose tears (988)
  { a: 935, b: 1018, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 53, to: 1.16, f: [540, 760], dur: 6, over: 0.14 }], shake: [[53, 30, 7]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b6fb0', col2: '#3567a6', pattern: 'dots', t: lt });
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 540, 860, 270, { ...ex2(t, 947, 'nervous', 'cry', 988, 'cry'), look: [0, 0], rig: { squash: take(t, 988, 0.12) + (t > 988 ? Math.sin(t * 1.9) * 0.025 : 0), headNod: t > 988 ? 0.1 * Math.sin(t * 0.9) : 0 } }), f); const hd = headOf('SAM_CHEF', o, f);
    const amt = f < 947 ? 0 : f < 988 ? 0.2 + 0.25 * lin(947, 975, f) : 0.6 + 0.4 * lin(988, 998, f);
    const ey = hd.y + hd.r * 0.05, edx = hd.r * 0.42;
    E.tearJet(ctx, hd.x - edx, ey, -1, amt, lt, { len: 460, seed: 1 }); E.tearJet(ctx, hd.x + edx, ey, 1, amt, lt, { len: 460, seed: 5 });
    E.onion(ctx, 230, 1360, 0.8, -0.2);
    if (f >= 988) FX.boom(ctx, 540, 250, 'SOB!!', (f - 988) / 5, { size: 140, col: '#fff', burst: '#1d4f8a', rot: -0.06, t: lt });
  } },
  // ===== 1018–1043 "Loudly." — wide: tear fountains everywhere, WAAAH, the kitchen shakes
  { a: 1018, b: 1043, whip: 'l', cam: { s: [1.06, 1.1], f: [540, 900], shake: [[0, 25, 10]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const o = CH(ctx, 'SAM_CHEF', (t) => ({ x: 540, y: 1880, h: 1360, pose: 'cheer', expr: 'cry', look: [0, 0], light: DAY, rig: { squash: Math.sin(t * 2.2) * 0.03 } }), f); const hd = headOf('SAM_CHEF', o, f);
    E.tearJet(ctx, hd.x - hd.r * 0.42, hd.y + hd.r * 0.05, -1, 1, lt, { len: 520, seed: 2 }); E.tearJet(ctx, hd.x + hd.r * 0.42, hd.y + hd.r * 0.05, 1, 1, lt, { len: 520, seed: 6 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.boom(ctx, 540, 330, 'WAAAAAH!', lf / 4, { size: 150, col: '#fff', burst: '#4fc3f7', rot: -0.05, t: lt });
  } },
  // ===== 1043–1083 "He forgot to mute." — the call: mic is ON, his tile lights up green, students 😳; snap on "mute" (1060)
  { a: 1043, b: 1083, whip: 'r', cam: { s: [1.0, 1.0], f: [540, 1300], snap: [{ at: 17, to: 1.5, dur: 7, f: [300, 1320], over: 0.1 }], shake: [[18, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#d63a3a', col2: '#c93333', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, state: 'call', t: lt, host: 1, hostName: 'Head Chef · Lumière', hc: { r: 70, fy: 0.42, expr: 'confused', look: [0.3, 0.2] }, stud: 5, cubes: 1, shock: true, samOff: true, samName: 'Not Sam', mic: 'on', micRing: 1, speak: 1, time: '7:11' });
    if (f >= 1061) FX.tag(ctx, 640, 1080, 'UNMUTED 🎤', { col: '#ffd43b', tcol: INK, size: 80, rot: -0.05, p: (f - 1061) / 4 });
  } },
  // ===== 1083–1133 "The head chef leaned in:" — host cam, he leans into the lens, squinting
  { a: 1083, b: 1133, whip: 'l', cam: { s: [1.0, 1.0], drift: 1 }, draw(ctx, lf, f, lt) {
    chefRoom(ctx, lt);
    const k = io(f, 1086, 1124);
    chefCam(ctx, f, (t) => ({ ...place('HEADCHEF', 540, lerp(820, 900, k), lerp(230, 430, k), { ...ex(t, 1098, 'stern', 'confused'), look: [0, 0.1], rig: { headTilt: 6 * k } }) }));
    E.webcam(ctx, { name: 'Head Chef · Lumière', muted: false, t: lt });
    if (f >= 1112) FX.questionMarks(ctx, 860, 330, Math.min(1, (f - 1112) / 6), lt);
  } },
  // ===== 1133–1241 "Not Sam… you sound just like my new assistant." — extreme close-up, mouthing, snap on "assistant" (1209)
  { a: 1133, b: 1241, cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 76, to: 1.14, dur: 6, f: [540, 900], over: 0.12 }], shake: [[77, 8, 6]] }, draw(ctx, lf, f, lt) {
    chefRoom(ctx, lt);
    const o = chefCam(ctx, f, (t) => ({ ...place('HEADCHEF', 540, 1000, 440, { ...ex2(t, 1133, 'confused', 'confused', 1209, 'stern'), look: [0, 0.1], say: say(1133, 1222, 'Not Sam... you sound just like my new assistant.'), rig: { headTilt: 6 - 10 * io(t, 1170, 1190) } }) }));
    const hd = headOf('HEADCHEF', o, f);
    E.webcam(ctx, { name: 'Head Chef · Lumière', muted: false, t: lt });
    FX.speechBubble(ctx, { x: 540, y: 300, text: f < 1170 ? 'Not Sam…' : 'Not Sam… you sound just like my new assistant.', tx: hd.x + 60, ty: hd.y - hd.r * 1.6, p: (lf - 1) / 6, size: 74, maxW: 940, hi: ['NOT', 'SAM', 'ASSISTANT'] });
  } },
  // ===== 1241–1287 "Sam said, 'Wrong number,'" — tear-streaked Sam leans to the phone
  { a: 1241, b: 1287, whip: 'r', cam: { s: [1.02, 1.1], f: [540, 820], snap: [{ at: 21, to: 1.12, dur: 6, f: [540, 760], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 540, 900, 250, { ...ex(t, 1262, 'nervous', 'smirk'), sweat: 1, look: [0.2, 0.3], say: say(1262, 1280, 'Wrong number.'), rig: { headTilt: -6 * io(t, 1258, 1266) } }), f); const hd = headOf('SAM_CHEF', o, f);
    E.tearJet(ctx, hd.x - hd.r * 0.42, hd.y + hd.r * 0.05, -1, 0.3, lt, { seed: 3 }); E.tearJet(ctx, hd.x + hd.r * 0.42, hd.y + hd.r * 0.05, 1, 0.3, lt, { seed: 7 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 1260) FX.speechBubble(ctx, { x: 540, y: 300, text: 'Wrong number.', tx: hd.x - 30, ty: hd.y - hd.r * 1.6, p: (f - 1260) / 6, size: 92, maxW: 900, hi: ['WRONG', 'NUMBER.'] });
  } },
  // ===== 1287–1322 "…and left the meeting." — Leave press (1292) → "You left the meeting." (1300)
  { a: 1287, b: 1322, whip: 'l', cam: { s: [1.0, 1.03], snap: [{ at: 3, to: 1.18, dur: 6, f: [740, 1220], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1d1a2e', col2: '#25213a', pattern: 'diag', t: lt });
    drawPhone(ctx, { ...PH, state: 'call', t: lt, host: 1, hostName: 'Head Chef · Lumière', hc: { r: 70, fy: 0.42, expr: 'confused' }, stud: 5, cubes: 1, samOff: true, samName: 'Not Sam', leave: lin(1290, 1297, f), left: lin(1299, 1305, f), time: '7:12' });
    if (f >= 1300) FX.boom(ctx, 800, 1400 - 120, 'YEET', (f - 1300) / 5, { size: 90, col: '#fff', burst: '#ff4d4d', rot: 0.1, t: lt });
  } },
  // ===== 1322–1368 "Twenty-six days left." — calendar, card (1330)
  { a: 1322, b: 1368, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[8, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(1323, 1329, f), pill: lin(1327, 1331, f), time: '7:13', day: 4, pillText: '⏳ 26 days left' });
    if (f >= 1330) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1330, 1335, f)); FX.confetti(ctx, lt, { n: 30, seed: 12 }); FX.daysLeftCard(ctx, lt, (f - 1330) / 8, '26'); }
  } },
  // ===== 1368–1480 "Did the head chef recognize him? Comment below!"
  { a: 1368, b: LEN, whip: 'l', cam: { s: [1.0, 1.08], f: [540, 900], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const A_ = (t) => ({ x: 440, y: 1900, h: 1250, ...(t < 1427 ? ptw(t, 1370, 6, 'stand', 'shrug') : ptw(t, 1427, 5, 'shrug', 'point')), ...ex(t, 1427, 'nervous', 'excited'), sweat: t < 1427 ? 1 : 0, look: [t < 1427 ? 0.4 * Math.sin(t * 0.15) : 0, t < 1427 ? -0.6 : 0.6], light: DAY, rig: { headTilt: 6 * Math.sin(t * 0.12), squash: take(t, 1428, 0.14) } });
    const o = CH(ctx, 'SAM_CHEF', A_, f); const hd = headOf('SAM_CHEF', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f < 1427) FX.questionMarks(ctx, hd.x, hd.y - hd.r * 2.2, Math.min(1, lf / 6), lt);
    [['HE KNOWS 😬', '#ff4d4d', '#fff', 300, 370, -0.07, 1380], ['NO IDEA 😅', '#ffd43b', INK, 780, 500, 0.06, 1395]].forEach(([t, c, tc, x, y, r, at], i) => { if (f >= at) FX.tag(ctx, x, y + Math.sin(lt * 2 + i) * 6, t, { col: c, tcol: tc, size: 64, rot: r, p: Math.min(1, (f - at) / 5) }); });
    if (f >= 1428) { FX.tag(ctx, 540, 210, 'DID HE RECOGNIZE SAM? 👇', { col: '#ffffff', tcol: INK, size: 52, rot: -0.02, p: (f - 1428) / 6 }); FX.tag(ctx, 540, 1180, 'COMMENT BELOW 👇', { col: '#ff4d4d', tcol: '#fff', size: 88, rot: 0.03, p: (f - 1429) / 5 }); }
  } },
];
