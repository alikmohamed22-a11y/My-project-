// Ep6 "Day 6 of 30": the head chef assigns "family meal" (staff lunch for 20) → the Bloop smart speaker orders 20 chefs →
// a 60-second recipe video at 2× → he boils ALL the pasta for 40 minutes → one giant noodle brick → "It's rustic." → "P.S. The owner is coming."
// Select with ?story=d6. 30 fps. Voice: chefd6/audio/voice.wav (46.1 s, Jesse eleven_v4 take 1, gentle silence trim + atempo 1.08); words in words_d6.json.
// All usernames / app / device / brand names on screen are invented (Bloop, Loopr, @speedy.spoon, Nonna Pina).
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash } from './util.js';
import { drawBg, drawFg } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import './phone_d3.js';
import './phone_d4.js';
import './phone_d5.js';
import './phone_d6.js';
import * as FX from './fx.js';
import './d2_art.js';
import * as D from './d3_art.js';
import * as E from './d4_art.js';
import * as S from './d5_art.js';
import * as A from './d6_art.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1426;
export const CAPCONF = {
  file: 'words_d6.json',
  keyY: ['FAMILY', 'MEAL', '20', 'BLOOP', 'VIDEO', '60', 'DOUBLE', 'SPEED', 'BOWED', 'BOX', '40', 'NOODLE', 'RUSTIC', 'OWNER', '24', 'KNOCKED', 'YOU'],
  keyR: ['ORDERING', 'CANCELLED', 'ALL', 'BRICK', 'COMING', 'STILL'],
  quotes: [[87, 150], [322, 395], [400, 444], [536, 600], [1100, 1152], [1182, 1212], [1282, 1336]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep5) ---------------- */
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
const BANNER = (p, out = 0) => ({ app: 'MESSAGES', title: 'Head Chef 👨‍🍳', body: 'Tomorrow, YOU cook family meal.', icon: '💬', iconCol: '#2fa75a', p, out, y: 110 });
const SAM_SLEEVE = '#f2b52b', ROOMIE_SLEEVE = '#7457c4';
const SPK = { x: 560, y: 1330, s: 1.55 };   // Bloop close-up position on the counter

// Sam on the couch at night with his phone
function couchSam(ctx, f, { e0 = 'neutral', e1 = 'shock', at = 9999, sweat = 0 } = {}) {
  drawBg(ctx, 'apt_night', { t: sec(f) });
  const A_ = (t) => ({ x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, at, e0, e1), look: [0.2, 0.7], light: NIGHT, rim: 'cool', sweat, rig: { squash: take(t, at, 0.14), headNod: t < at ? 0.2 : -0.25 * io(t, at, at + 6) } });
  const o = CH(ctx, 'SAM', A_, f); const hd = headOf('SAM', o, f);
  FX.phoneGlow(ctx, hd.x + 40, hd.y + hd.r * 1.6, 380, '#8fd0ff', 0.4);
  drawFg(ctx, 'apt_night', { t: sec(f) });
  return hd;
}
const crewBg = (ctx, lt) => { drawBg(ctx, 'solid', { col: '#1f6f66', col2: '#237a70', pattern: 'diag', t: lt }); FX.phoneGlow(ctx, 540, 900, 800, '#7ee0c8', 0.2); };
// the recipe video frame (inside the phone): phase by output frame
function videoFrame(f, lt) {
  return (c, w, h) => {
    c.fillStyle = '#c98a5e'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#b7784e'; for (let i = 0; i < 8; i++) c.fillRect(0, i * 130 + 40, w, 10);
    if (f < 676) { A.pastaPlate(c, w / 2, h * 0.62, 1.05, { t: lt }); c.save(); c.font = '400 120px Anton'; c.textAlign = 'center'; c.lineWidth = 16; c.strokeStyle = INK; c.lineJoin = 'round'; c.strokeText('60 SEC', w / 2, 220); c.fillStyle = '#ffd43b'; c.fillText('60 SEC', w / 2, 220); c.restore(); return; }
    const blur = (x, y) => FX.motionLines(c, x, y, 1, 0, { n: 4, len: 140, spread: 300, t: lt, col: '#fff' });
    if (f < 712) {           // chop: knife a blur, tomato cubes multiplying
      E.board(c, w / 2, h * 0.7, 1.0, { cubes: lin(678, 708, f) });
      const up = Math.abs(Math.sin(f * 1.9)); E.knife(c, w / 2 + 40, h * 0.7 - 120 - up * 130, 1.0, -0.2);
      blur(w * 0.2, h * 0.4); label(c, w, 'CHOP');
    } else if (f < 730) {    // boil
      D.pot(c, w / 2, h * 0.86, 1.6, { fill: 0, t: lt, inside: (cc, sy) => A.potNoodles(cc, sy, 0.2, lt) });
      FX.steam(c, w / 2, h * 0.4, lt, { amt: 1, w: 400, h: 300 }); label(c, w, 'BOIL');
    } else if (f < 749) {    // plate
      A.pastaPlate(c, w / 2, h * 0.64, 1.0, { t: lt }); FX.sparkle(c, w * 0.8, h * 0.4, 1.2, lt); FX.sparkle(c, w * 0.2, h * 0.5, 1, lt + 1); label(c, w, 'PLATE');
    } else {                 // bow
      const b = Math.max(0, Math.sin((f - 749) / 10 * Math.PI)); A.miniChef(c, w / 2, h * 0.5, 190, { seed: 9, bow: b * 0.9, happy: 1, scarf: '#ff3d6e' });
      FX.confetti(c, lt, { n: 24, seed: 4 }); label(c, w, 'TA-DA!');
    }
  };
}
function label(c, w, s) { c.save(); c.font = '400 92px Anton'; c.textAlign = 'center'; c.lineWidth = 14; c.strokeStyle = INK; c.lineJoin = 'round'; c.strokeText(s, w / 2, 190); c.fillStyle = '#fff'; c.fillText(s, w / 2, 190); c.restore(); }

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–30 "Day 6." — title card; the head chef's text drops in at once (hook)
  { a: 0, b: 30, cam: { s: [1, 1.06], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#b8432f', col2: '#c44c37', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 30, seed: 9 });
    FX.titleCard(ctx, lt, { big: 'DAY 6', p: 0.4 + lf / 10, out: lin(25, 30, lf) });
    FX.notifBanner(ctx, BANNER((f - 2) / 7));
  } },
  // ===== 30–87 "The head chef texted Sam," — couch at night; gulp on "Sam" (66)
  { a: 30, b: 87, whip: 'r', cam: { s: [1.04, 1.16], f: [470, 820], drift: 3 }, draw(ctx, lf, f, lt) {
    const hd = couchSam(ctx, f, { e0: 'neutral', e1: 'shock', at: 64, sweat: f >= 64 ? 1 : 0 });
    FX.notifBanner(ctx, BANNER(1, lin(78, 86, f)));
    if (f >= 66) { FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.6, 1.2, lt, (lf % 13) * 6); FX.tag(ctx, 770, 560, 'FAMILY MEAL?! 😳', { col: '#ffd43b', tcol: INK, size: 66, rot: 0.07, p: (f - 66) / 5 }); }
  } },
  // ===== 87–153 "'Tomorrow, you cook family meal.'" — the thread; YOU highlighted + snap (112)
  { a: 87, b: 153, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 700], snap: [{ at: 25, to: 1.18, dur: 6, f: [420, 520], over: 0.1 }], shake: [[26, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'dots', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#e6b84a', 0.25);
    drawPhone(ctx, { ...PH, y: phoneIn(lf, 7), state: 'chef6', t: lt, n: lin(89, 95, f) + lin(136, 142, f), hi: lin(112, 120, f), time: '9:41' });
    if (f >= 116) FX.tag(ctx, 800, 1020, 'ME?! 😨', { col: '#ff4d4d', tcol: '#fff', size: 80, rot: 0.08, p: (f - 116) / 5 });
  } },
  // ===== 153–230 "Family meal is lunch for the whole kitchen." — the crew pops in, row by row
  { a: 153, b: 230, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    crewBg(ctx, lt);
    A.crew(ctx, { n: 20, k: lin(176, 214, f), x0: 130, y0: 560, dy: 205, r: 60, t: lt });
    FX.tag(ctx, 540, 250, 'FAMILY MEAL 🍽️', { col: '#fff', tcol: INK, size: 92, rot: -0.04, p: (f - 155) / 5 });
    if (f >= 186) FX.tag(ctx, 540, 380, '= STAFF LUNCH', { col: '#ffd43b', tcol: INK, size: 64, rot: 0.04, p: (f - 186) / 5 });
  } },
  // ===== 230–262 "Twenty chefs!" — snap in: twenty open mouths
  { a: 230, b: 262, cam: { s: [1.06, 1.1], f: [540, 900], snap: [{ at: 1, to: 1.16, dur: 5, f: [540, 860], over: 0.12 }], shake: [[2, 10, 6]] }, impact: { at: 0, n: 1, type: 'red', col: '#ffd43b' }, draw(ctx, lf, f, lt) {
    crewBg(ctx, lt); FX.actionLines(ctx, 540, 900, lt, { col: 'rgba(255,255,255,0.35)' });
    A.crew(ctx, { n: 20, k: 1, x0: 130, y0: 560, dy: 205, r: 60, t: lt, mouth: lin(231, 236, f), look: 0.001 });
    FX.boom(ctx, 540, 300, '20 CHEFS!', lf / 4, { size: 150, col: '#ffd43b', burst: '#ff4d4d', rot: -0.05, t: lt });
    if (f >= 244) FX.tag(ctx, 800, 470, 'HUNGRY 😬', { col: '#fff', tcol: INK, size: 64, rot: 0.08, p: (f - 244) / 5 });
  } },
  // ===== 262–330 "Sam asked his smart speaker, Bloop!" — kitchen: Sam points at the little speaker; its ring wakes on "Bloop!" (322)
  { a: 262, b: 330, whip: 'l', cam: { s: [1.0, 1.05], f: [600, 820], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const o = CH(ctx, 'SAM', (t) => ({ x: 330, y: 1900, h: 1240, ...ptw(t, 266, 7, 'stand', 'point'), ...ex(t, 320, 'nervous', 'determined'), look: [0.7, 0.1], light: DAY, say: say(320, 328, 'Bloop!'), rig: { squash: take(t, 321, 0.08) } }), f);
    A.bloop(ctx, 900, 1035, 0.62, { ring: lin(322, 326, f), t: lt, col: '#4fc3f7' });
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 286) FX.tag(ctx, 830, 760, 'BLOOP 🔵', { col: '#ff8a6a', tcol: '#fff', size: 64, rot: 0.06, p: (f - 286) / 5 });
    if (f >= 300) FX.tag(ctx, 830, 860, 'smart speaker', { col: '#fff', tcol: INK, size: 40, rot: 0.06, p: (f - 300) / 5 });
  } },
  // ===== 330–395 "How do I feed twenty chefs?" — close on Bloop, listening; Sam's question in a bubble
  { a: 330, b: 395, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 1000], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'counter_cu', { t: sec(f) });
    A.bloop(ctx, SPK.x, SPK.y, SPK.s, { ring: 1, t: lt, col: '#4fc3f7', talk: 0.3 });
    FX.speechBubble(ctx, { x: 470, y: 420, text: 'Bloop, how do I feed 20 chefs?', tx: 120, ty: 760, p: (lf - 1) / 6, size: 74, maxW: 860, hi: ['20', 'CHEFS?'] });
    if (f >= 368) FX.tag(ctx, 850, 820, 'listening…', { col: '#4fc3f7', tcol: INK, size: 46, rot: 0.06, p: (f - 368) / 5 });
  } },
  // ===== 395–446 "'Ordering twenty chefs.'" — Bloop answers (green ring); ORDER PLACED banner (421)
  { a: 395, b: 446, cam: { s: [1.0, 1.04], f: [540, 1000], snap: [{ at: 26, to: 1.12, dur: 6, f: [540, 900], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'counter_cu', { t: sec(f) });
    A.bloop(ctx, SPK.x, SPK.y, SPK.s, { ring: 1, t: lt, col: '#7ee081', talk: f < 434 ? 1 : 0 });
    if (f < 434) { A.waves(ctx, SPK.x + 200, SPK.y - 230, lt, { col: '#fff' }); A.waves(ctx, SPK.x - 200, SPK.y - 230, lt, { col: '#fff', dir: -1 }); }
    FX.speechBubble(ctx, { x: 540, y: 520, text: 'Ordering 20 chefs. 🛒', tx: SPK.x, ty: SPK.y - 360, p: (lf - 1) / 5, size: 80, maxW: 900, hi: ['ORDERING'] });
    FX.notifBanner(ctx, { app: 'BLOOP', title: 'Order placed ✅', body: '20 × Chef (assorted) · arrives tomorrow', icon: '🛒', iconCol: '#ff8a6a', p: (f - 421) / 7, y: 110 });
  } },
  // ===== 446–478 "He cancelled." — Sam's hand slaps the speaker (450); red ring; CANCELLED stamp
  { a: 446, b: 478, whip: 'l', cam: { s: [1.02, 1.06], f: [540, 1050], shake: [[5, 14, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'counter_cu', { t: sec(f) });
    const hit = eIn(k01(f, 446, 451)), sq = f >= 451 ? Math.max(0, 1 - (f - 451) / 8) : 0;
    A.bloop(ctx, SPK.x, SPK.y, SPK.s, { ring: f >= 451 ? 1 : 1, t: lt, col: f >= 451 ? '#ff4d4d' : '#7ee081', squash: sq * 0.8 });
    const hy = lerp(200, SPK.y - 210 * SPK.s * (1 - sq * 0.3) - 40, hit) - (f > 462 ? (f - 462) * 40 : 0);
    A.fist(ctx, SPK.x + 20, hy - 30, 1.2, Math.PI, { sleeve: SAM_SLEEVE, skin: '#c98a5e', skinS: '#a56a44' });
    if (f >= 451 && f < 464) FX.impactLines(ctx, SPK.x, SPK.y - 330, 300, lt, { n: 12, col: '#fff', lw: 10 });
    if (f >= 452) FX.stamp(ctx, 540, 640, 'CANCELLED', (f - 452) / 10, { col: '#e8412f', size: 110, rot: -0.1, t: lt });
  } },
  // ===== 478–604 "Then he found a recipe video. 'Easy pasta in sixty seconds.'" — Loopr video page; title snap (565)
  { a: 478, b: 604, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 87, to: 1.14, dur: 6, f: [460, 1180], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, y: phoneIn(lf, 8), rot: (1 - k01(lf, 0, 8)) * 0.08, state: 'vid6', t: lt, content: videoFrame(f, lt), play: 1, prog: 0, time: '9:52' });
    if (f >= 566) FX.tag(ctx, 800, 300, '60 SECONDS?! ⏱️', { col: '#ff4d4d', tcol: '#fff', size: 66, rot: 0.06, p: (f - 566) / 5 });
    if (f >= 540) FX.sparkle(ctx, 170, 520, 1, lt);
  } },
  // ===== 604–676 "He played it at double speed, to save time." — speed sheet, thumb taps 2× (626), badge
  { a: 604, b: 676, cam: { s: [1.0, 1.04], f: [540, 1000], snap: [{ at: 24, to: 1.1, dur: 6, f: [540, 1250], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'grid', t: lt });
    const menu = lin(605, 612, f) * (1 - lin(640, 647, f));
    drawPhone(ctx, { ...PH, state: 'vid6', t: lt, content: videoFrame(560, lt), play: 1 - lin(645, 650, f), prog: 0, menu, pick: lin(626, 632, f), speed: f >= 646 ? '2×' : null, time: '9:52',
      thumb: f >= 612 && f < 640 ? [560, lerp(1500, 1040, eOut(k01(f, 612, 624)))] : null, thumbPress: lin(624, 628, f) * (1 - lin(630, 634, f)) });
    if (f >= 648) FX.tag(ctx, 300, 280, '2× SPEED ⏩', { col: '#ff3d6e', tcol: '#fff', size: 80, rot: -0.06, p: (f - 648) / 5 });
    if (f >= 659) FX.tag(ctx, 790, 420, 'BIG BRAIN 🧠', { col: '#fff', tcol: INK, size: 56, rot: 0.07, p: (f - 659) / 5 });
  } },
  // ===== 676–777 "The chef chopped, boiled, plated, and bowed." — the video at 2×, hard cuts on each verb
  { a: 676, b: 777, whip: 'l', cam: { s: [1.12, 1.16], f: [540, 620], shake: [[14, 6, 4], [36, 6, 4], [54, 6, 4], [73, 6, 4]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#ff3d6e', col2: '#f2335f', pattern: 'burst', t: lt * 3, cy: 700 });
    FX.speedLines(ctx, lt * 2);
    drawPhone(ctx, { ...PH, state: 'vid6', t: lt, content: videoFrame(f, lt), prog: lin(676, 760, f), speed: '2×', time: '9:53' });
  } },
  // ===== 777–837 "Sam was still opening the box." — Sam wrestles the spaghetti box
  { a: 777, b: 837, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const tug = Math.sin(lt * 14);
    const o = CH(ctx, 'SAM', (t) => ({ x: 520, y: 1880, h: 1360, pose: 'holdUp', ...ex(t, 806, 'determined', 'wince'), look: [0.3, -0.5], light: DAY, sweat: t > 806 ? 1 : 0, rig: { squash: 0.02 * Math.sin(t * 1.4), headTilt: 4 * Math.sin(t * 0.47) } }), f);
    const hn = handOf('SAM', o, f);
    A.pastaBox(ctx, hn.x + 10 + tug * 10, hn.y + 150, 0.9, 0.1 + tug * 0.06, { tug: 1 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.motionLines(ctx, hn.x + 150, hn.y + 120, 1, 0, { n: 3, len: 80, spread: 160, t: lt, col: INK });
    if (f >= 790) FX.tag(ctx, 300, 260, 'STILL OPENING 📦', { col: '#ff4d4d', tcol: '#fff', size: 70, rot: -0.05, p: (f - 790) / 5 });
    if (f >= 806) FX.tag(ctx, 820, 420, 'VIDEO: DONE ✓', { col: '#2fa75a', tcol: '#fff', size: 52, rot: 0.07, p: (f - 806) / 5 });
  } },
  // ===== 837–926 "So he just boiled the pasta. All of it." — the whole bundle drops in (850); empty boxes rain down (905)
  { a: 837, b: 926, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 1050], drift: 2, snap: [{ at: 68, to: 1.1, dur: 6, f: [540, 1000], over: 0.1 }], shake: [[14, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    const inPot = f >= 851;
    D.pot(ctx, 540, 1330, 1.9, { fill: 0, t: lt, inside: (c, sy) => { if (inPot) A.potNoodles(c, sy, 0.15 + lin(851, 920, f) * 0.25, lt); else { c.save(); c.fillStyle = '#9fd3e8'; c.beginPath(); c.ellipse(0, sy + 20, 140, 40, 0, 0, 7); c.fill(); c.restore(); } } });
    if (!inPot) A.spaghetti(ctx, 540, lerp(-200, 650, eIn(k01(f, 838, 851))), 620, 0.05, 30);
    FX.steam(ctx, 540, 820, lt, { amt: 0.6, w: 420, h: 400 });
    if (f >= 851 && f < 862) FX.boom(ctx, 760, 520, 'SPLOSH', (f - 851) / 4, { size: 100, col: '#9fd3e8', burst: null, rot: 0.1, t: lt });
    for (let i = 0; i < 4; i++) { const k = (f - 905 - i * 3) / 10; if (k > 0) A.pastaBox(ctx, [180, 900, 300, 820][i], Math.min(1500, -300 + k * 1100), 0.6, (i - 1.5) * 0.5 + k * (i % 2 ? 2 : -2), { open: 1, empty: true }); }
    drawFg(ctx, 'burner_cu', { t: sec(f), on: 1 });
    if (f >= 906) FX.tag(ctx, 540, 260, 'ALL OF IT 😳', { col: '#ff4d4d', tcol: '#fff', size: 92, rot: -0.04, p: (f - 906) / 5 });
  } },
  // ===== 926–970 "For forty minutes." — time-lapse: clock hands whizz, the mass rises over the rim
  { a: 926, b: 970, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 1000] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    const k = lin(928, 962, f);
    D.pot(ctx, 540, 1330, 1.9, { fill: 0, t: lt, inside: (c, sy) => A.potNoodles(c, sy, 0.5 + k * 0.5, lt) });
    FX.steam(ctx, 540, 760, lt, { amt: 1, w: 520, h: 520 });
    A.wallClock(ctx, 820, 330, 150, k * 40);
    const m = Math.round(k * 40); D.timerBadge(ctx, 240, 380, `${m}:00`, 1, m >= 40 ? '#ff4d4d' : '#fff', m >= 40 ? '#fff' : INK);
    if (f >= 945) FX.tag(ctx, 540, 640, '(IT SAYS 9 MIN)', { col: '#fff', tcol: INK, size: 52, rot: 0.04, p: (f - 945) / 5 });
  } },
  // ===== 970–1053 "It came out as one giant noodle brick." — the upturned pot lifts (990–1010), the brick stands; THUNK on "brick" (1036)
  { a: 970, b: 1053, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 1100], snap: [{ at: 66, to: 1.16, dur: 6, f: [540, 1100], over: 0.12 }], shake: [[66, 14, 8]] }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -250); drawBg(ctx, 'counter_cu', { t: sec(f) });
    const gy = 1420, ps = 1.75, lift = eInOut(k01(f, 990, 1012)) * 900;
    E.board(ctx, 540, gy + 20, 1.2, {});
    if (f >= 990) A.noodleBrick(ctx, 540, gy, 1.3, { t: lt, steam: lin(1000, 1015, f), wob: f >= 1036 ? Math.max(0, 1 - (f - 1036) / 12) : 0 });
    if (lift < 890) { ctx.save(); ctx.translate(540, gy - 175 * ps - lift - 10); ctx.rotate(Math.PI); D.pot(ctx, 0, 0, ps, { fill: 0, t: lt }); ctx.restore(); }
    if (f >= 1036) { FX.boom(ctx, 540, 420, 'THUNK.', (f - 1036) / 4, { size: 140, col: '#fff', burst: '#8a6a2a', rot: -0.05, t: lt }); FX.tag(ctx, 800, 640, 'NOODLE BRICK 🧱', { col: '#ffd43b', tcol: INK, size: 60, rot: 0.06, p: (f - 1040) / 5 }); }
  } },
  // ===== 1053–1100 "His roommate knocked on it." — a purple-sleeved fist knocks twice (1069, 1077)
  { a: 1053, b: 1100, whip: 'r', cam: { s: [1.06, 1.1], f: [540, 1100], shake: [[16, 6, 4], [24, 6, 4]] }, draw(ctx, lf, f, lt) {
    ctx.translate(0, -250); drawBg(ctx, 'counter_cu', { t: sec(f) });
    const gy = 1420; E.board(ctx, 540, gy + 20, 1.2, {}); A.noodleBrick(ctx, 540, gy, 1.3, { t: lt, steam: 0.6 });
    const kn = (at) => { const a = f - at; return a < -4 || a > 4 ? 0 : 1 - Math.abs(a) / 4; }, k = Math.max(kn(1069), kn(1077));
    const ent = eOut(k01(f, 1055, 1064));
    A.fist(ctx, lerp(1400, 875, ent) - k * 70, 1270 - (1 - ent) * 150, 1.3, -Math.PI / 2 - 0.12);
    if (f >= 1069) FX.boom(ctx, 300, 560, 'KNOCK', (f - 1069) / 3, { size: 110, col: '#fff', burst: null, rot: -0.1, t: lt });
    if (f >= 1077) FX.boom(ctx, 700, 760, 'KNOCK', (f - 1077) / 3, { size: 110, col: '#fff', burst: null, rot: 0.08, t: lt });
  } },
  // ===== 1100–1157 "'Bro… is that a brick?'" — the roommate, deadpan-confused
  { a: 1100, b: 1157, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 860], snap: [{ at: 34, to: 1.08, dur: 6, f: [540, 820], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const o = CH(ctx, 'ROOMMATE', (t) => place('ROOMMATE', 540, 820, 220, { pose: 'stand', ...ex(t, 1118, 'deadpan', 'confused'), look: [0, 0.2], light: DAY, say: say(1100, 1146, 'Bro... is that a brick?'), rig: { headTilt: 6 * io(t, 1118, 1130) } }), f);
    const hd = headOf('ROOMMATE', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.speechBubble(ctx, { x: 540, y: 300, text: f < 1118 ? 'Bro…' : 'Bro… is that a brick?', tx: hd.x, ty: hd.y - hd.r * 2.2, p: (lf - 1) / 6, size: 84, maxW: 900, hi: ['BRICK?'] });
  } },
  // ===== 1157–1212 "Sam said, 'It's rustic.'" — Sam, proud, presents the brick like fine dining
  { a: 1157, b: 1212, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt, cy: 900 });
    FX.phoneGlow(ctx, 540, 900, 600, '#fff6c4', 0.5);
    const o = CH(ctx, 'SAM', (t) => place('SAM', 540, 700, 210, { ...ptw(t, 1160, 8, 'stand', 'shrug'), ...ex(t, 1180, 'nervous', 'proud'), look: [0, 0], say: say(1182, 1204, "It's rustic."), rig: { squash: take(t, 1182, 0.08) } }), f);
    const hd = headOf('SAM', o, f);
    A.noodleBrick(ctx, 540, 1470, 0.95, { t: lt, steam: 0.5, fork: 1 });
    FX.speechBubble(ctx, { x: 540, y: 250, text: f < 1180 ? '…' : "It's rustic.", tx: hd.x + 40, ty: hd.y - hd.r * 2.0, p: (lf - 1) / 6, size: 90, maxW: 900, hi: ['RUSTIC.'] });
    if (f >= 1192) { FX.sparkle(ctx, 250, 1000, 1.2, lt); FX.sparkle(ctx, 840, 1080, 1, lt + 1); FX.tag(ctx, 830, 1200, 'RUSTIC ✨', { col: '#fff', tcol: INK, size: 64, rot: 0.06, p: (f - 1192) / 5 }); }
  } },
  // ===== 1212–1282 "Then the head chef texted again." — thread: Sam's brave reply, then typing dots
  { a: 1212, b: 1282, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'dots', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#e6b84a', 0.25);
    drawPhone(ctx, { ...PH, y: phoneIn(lf, 7), state: 'chef6', t: lt, n: 2, hi: 1, mine: 1, typing: f >= 1238, time: '9:58' });
    if (f >= 1240) FX.tag(ctx, 300, 1180, 'typing… 😰', { col: '#fff', tcol: INK, size: 60, rot: -0.06, p: (f - 1240) / 5 });
  } },
  // ===== 1282–1322 "'P.S. The owner is coming.'" — the P.S. lands; "owner" highlighted + snap (1306)
  { a: 1282, b: 1322, cam: { s: [1.04, 1.06], f: [540, 900], snap: [{ at: 24, to: 1.2, dur: 6, f: [460, 1000], over: 0.1 }], shake: [[24, 10, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'dots', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, '#ff4d4d', 0.25);
    drawPhone(ctx, { ...PH, state: 'chef6', t: lt, n: 2, hi: 1, mine: 1, ps: lin(1284, 1290, f), hi2: lin(1306, 1314, f), time: '9:58' });
  } },
  // ===== 1322–1342 (reaction) — Sam's panic close; THE OWNER?!
  { a: 1322, b: 1342, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 1, to: 1.1, dur: 4, f: [540, 760], over: 0.12 }] }, impact: { at: 0, n: 2, type: 'red', col: '#ff4d4d' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#b8432f', col2: '#c44c37', pattern: 'burst', t: lt * 0.3, cy: 900 });
    const o = CH(ctx, 'SAM', (t) => place('SAM', 540, 900, 240, { expr: 'panic', look: [0, 0], blink: 0, sweat: 1, rig: { squash: take(t, 1323, 0.14) + Math.sin(t * 3.1) * 0.006 } }), f);
    const hd = headOf('SAM', o, f);
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.5, 1.3, lt, 0);
    FX.tag(ctx, 540, 300, 'THE OWNER?! 😱', { col: '#ffd43b', tcol: INK, size: 96, rot: -0.05, p: (f - 1324) / 4 });
  } },
  // ===== 1342–1426 "Twenty-four days left." — calendar, card (1348), CTA (1384)
  { a: 1342, b: LEN, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[6, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(1343, 1349, f), pill: lin(1347, 1351, f), time: '9:59', day: 6, pillText: '⏳ 24 days left' });
    if (f >= 1348) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1348, 1353, f)); FX.confetti(ctx, lt, { n: 30, seed: 17 }); FX.daysLeftCard(ctx, lt, (f - 1348) / 8, '24'); }
    if (f >= 1392) FX.tag(ctx, 540, 1250, 'WHAT SHOULD SAM COOK TOMORROW? 👇', { col: '#ffd43b', tcol: INK, size: 48, rot: -0.03, p: (f - 1392) / 6 });
  } },
];
